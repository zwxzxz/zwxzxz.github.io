---
title: K8S安装Nacos
published: 2024-05-08
description: K8S内安装Nacos 2.2.3，默认已经安装MySQL
tags: [Nacos, Kubernetes]
category: 安装教程
draft: false
image: https://api.miaomc.cn/image/get?16
---

## MySQL操作(安装前)

创建用户

```mysql
CREATE USER 'nacos'@'%' IDENTIFIED BY '密码';
```

赋予nacos库所有权限, 刷新权限

```mysql
GRANT ALL PRIVILEGES ON nacos.* TO 'nacos'@'%';
FLUSH PRIVILEGES;
```

创建库

```mysql
CREATE DATABASE `nacos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
```

导入表：下载2.2.3版本sql文件：[点这](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/file/nacos-mysql-schema2-2-3.sql)

```mysql
use nacos;
source nacos-mysql-schema2-2-3.sql
```

## 安装Nacos

> 根据[nacos-k8s](https://github.com/nacos-group/nacos-k8s/tree/master/deploy/nacos)进行yaml文件编写

>根据nacos-docker的[环境变量](https://github.com/nacos-group/nacos-docker/blob/master/README_ZH.md#%E5%B1%9E%E6%80%A7%E9%85%8D%E7%BD%AE%E5%88%97%E8%A1%A8)
>
>SPRING_DATASOURCE_PLATFORM 默认:空  若不指定为mysql, 则一直是embedded嵌入式存储模式

`nacos.yaml`

```yaml
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: nacos
  name: nacos
spec:
  # 指定serviceName
  serviceName: nacos
  # Parallel: 并行启动pod
  podManagementPolicy: Parallel
  replicas: 1
  selector:
    matchLabels:
      app: nacos
  template:
    metadata:
      labels:
        app: nacos
    spec:
      containers:
      - env:
        # 镜像的环境变量指定使用mysql
        - name: SPRING_DATASOURCE_PLATFORM
          value: mysql
        # 使用主机,因为k8s ip会变
        - name: PREFER_HOST_MODE
          value: hostname
        # 模式:单实例
        - name: MODE
          value: standalone
        # 暴露metrics数据: /nacos/actuator/prometheus
        - name: MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE
          value: "*"
        # 数据库信息
        - name: MYSQL_SERVICE_HOST
          valueFrom:
            configMapKeyRef:
              name: nacos-cm
              key: mysql.host
        - name: MYSQL_SERVICE_DB_NAME
          valueFrom:
            configMapKeyRef:
              name: nacos-cm
              key: mysql.db.name
        - name: MYSQL_SERVICE_PORT
          valueFrom:
            configMapKeyRef:
              name: nacos-cm
              key: mysql.port
        - name: MYSQL_SERVICE_USER
          valueFrom:
            configMapKeyRef:
              name: nacos-cm
              key: mysql.user
        - name: MYSQL_SERVICE_PASSWORD
          valueFrom:
            configMapKeyRef:
              name: nacos-cm
              key: mysql.password
        image: registry.cn-hangzhou.aliyuncs.com/kongxin/nacos-server:v2.2.3
        imagePullPolicy: IfNotPresent
        name: nacos
        ports:
        - containerPort: 8848
          name: server
          protocol: TCP
        - containerPort: 9848
          name: client-rpc
          protocol: TCP
        - containerPort: 9849
          name: raft-rpc
          protocol: TCP
        # 资源限制
        resources:
          limits:
            cpu: 2
            memory: 2Gi
          requests:
            cpu: 100m
            memory: 512Mi
      restartPolicy: Always
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nacos-cm
data:
  mysql.host: "10.129.130.211"
  mysql.db.name: "nacos"
  mysql.port: "3306"
  mysql.user: "root"
  mysql.password: "W5BvtSPrKqa/K)J"
---
apiVersion: v1
kind: Service
metadata:
  name: nacos
  labels:
    app: nacos
spec:
  type: NodePort
  # Pod 未就绪也发布Endpoint
  publishNotReadyAddresses: true
  ports:
  - port: 8848
    name: server
    targetPort: 8848
    nodePort: 31848
  - port: 9848
    name: client-rpc
    targetPort: 9848
    nodePort: 31948
  - port: 9849
    name: raft-rpc
    targetPort: 9849
    nodePort: 31949
  selector:
    app: nacos
```

```sh
kubectl apply -f nacos.yaml
```

集群内访问地址：

- service domain: `nacos.default.svc.cluster.local:8848`

- pod dns: `nacos-0.nacos.default.svc.cluster.local:8848`

集群外访问地址：`节点IP:31848/nacos/`

