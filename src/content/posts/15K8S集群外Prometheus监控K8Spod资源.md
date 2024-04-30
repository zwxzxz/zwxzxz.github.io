---
title: K8S集群外Prometheus监控K8S pod资源
published: 2024-04-26
tags: [监控, prometheus, kubernetes]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?15
---


>场景：
>
>业务部署在 Kubernetes 中，监控不想部署在 K8S 里，想在 K8S 外的单独 Prometheus 监控到K8S内的pod
>
> 缺陷: Prometheus只能装在K8S节点里才可以访问POD IP

## 创建RBAC

案例创建集群范围权限(ClusterRole)，若只想对某个命名空间访问权限使用Role

`prom-rbac.yaml`

```yaml
# 角色: 权限定义(理解为访问集群有哪些操作权限)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" 忽略，因为 ClusterRoles 不受名字空间限制
  name: prometheus
rules:
  # core API 组
- apiGroups: [""]
  # 可访问资源
  resources: ["nodes", "services", "endpoints", "pods","nodes/proxy"]
  # 可以执行动作
  verbs: ["get", "watch", "list"]
---
# 服务账户
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring  
---
# 角色绑定: 将角色中定义的权限赋予一个或者一组用户
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus

# 绑定的主体
subjects:
  # 类型(User/Group/ServiceAccount)
- kind: ServiceAccount
  # 服务名称: ServiceAccount的metadata.name
  name: prometheus
  # 命名空间: ServiceAccount的metadata.namespace
  namespace: monitoring
  
# 指定和角色的绑定关系
roleRef:
  # 绑定的角色类型
  kind: ClusterRole
  # ClusterRole的名称: ClusterRole的metadata.name
  name: prometheus
  apiGroup: rbac.authorization.k8s.io
---
# Secret: 存放ServiceAccount的凭据
apiVersion: v1
kind: Secret
# 类型为service-account-token
type: kubernetes.io/service-account-token
metadata:
  name: monitoring-token
  namespace: monitoring
  annotations:
    # 指定 ServiceAccount的metadata.name
    kubernetes.io/service-account.name: "prometheus"
```

## 导出访问凭证到文件

查看secrets内容

```bash
> kubectl describe secrets -n monitoring monitoring-token

Name:         monitoring-token
Namespace:    monitoring
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: prometheus
              kubernetes.io/service-account.uid: e3b6e0ee-90cc-442f-aa92-dbe952a95e75

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1099 bytes
namespace:  10 bytes
# token太长了, 用xxx代替了
token:    xxxxxxxx
```

把token写入文件：`/root/k8s.token`

```sh
vim /root/k8s.token
-----------------------------------
xxxxxxxx
-----------------------------------
```

## 修改Prometheus配置文件

`/root/prometheus.yml`

```yaml
global:
  scrape_timeout:      60s
  evaluation_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
        labels:
          instance: prometheus

  - job_name: 'kubernetes-发现指定namespace的所有pod'
    kubernetes_sd_configs:
      # 类型
    - role: pod
      # api_server地址
      api_server: https://10.129.130.205:6443
      tls_config:
        insecure_skip_verify: true
      # token文件
      bearer_token_file: /prometheus/k8s.token
      # 过滤命名空间
      namespaces:
        names:
        - platform-test
    relabel_configs:
    - action: labelmap
      regex: __meta_kubernetes_pod_label_(.+)
    - source_labels: [__meta_kubernetes_namespace]
      action: replace
      target_label: kubernetes_namespace
    - source_labels: [__meta_kubernetes_pod_name]
      action: replace
      target_label: kubernetes_pod_name
    # 业务程序是java,我这边替换监测接口
    - replacement: /actuator/prometheus
      target_label: __metrics_path__
    # 命名空间下不是所有pod都要监控, 过滤
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
```

## docker-compose文件

`prometheus-compose.yaml`：映射配置文件, 集群认证token

```yaml
version: '3'

services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    hostname: prometheus
    restart: always
    volumes:
      # prometheus配置文件
      - /root/prometheus.yml:/etc/prometheus/prometheus.yml
      # token文件
      - /root/k8s.token:/prometheus/k8s.token
      - /etc/localtime:/etc/localtime
    ports:
      - "9090:9090"
```

## 启动

```sh
docker compose -f prometheus-compose.yaml up
```

访问查看

![image-20240426114103763](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240426114103763.png)