---
title: prometheus远程写
published: 2024-06-12
description: prometheus远程存储数据到另一prometheus
tags: [prometheus]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?24
---

## 场景

>  prometheus远程存储数据到另一prometheus，grafana只连接一个prometheus作为数据源
>
>  k8s内prometheus数据存储到外部prometheus

## 案例

### 外部prometheus

`docker-compose-1.yaml`

```yaml
version: '3'

services:
  prometheus-1:
    # Prometheus版本要 > v2.25.0
    image: prom/prometheus
    container_name: prometheus-1
    hostname: prometheus
    user: root
    restart: always
    ports:
      - "9090:9090"
    volumes:
      # 数据存储
      - /root/prometheus-1/data:/prometheus
      # 配置
      - /root/prometheus-1/conf:/etc/prometheus
      # 主机映射
      - /etc/hosts:/etc/hosts
      # 时区
      - /etc/localtime:/etc/localtime
    command:
      - '--config.file=/etc/prometheus/prometheus.yaml'
      # 主要配置：开启远程写入
      - '--enable-feature=remote-write-receiver'
```

配置文件：`/root/prometheus-1/conf/prometheus.yaml`

```yaml
global:
  scrape_interval:     30s
  scrape_timeout:      15s
  evaluation_interval: 30s
```

启动

```sh
docker compose -f docker-compose-1.yaml up -d
```

![image-20240612152643569](C:\Users\Frank\AppData\Roaming\Typora\typora-user-images\image-20240612152643569.png)

### k8s内prometheus

由于本人k8s内prometheus是helm安装，helm value.yaml配置太长就不展示了，用docker启动prometheus做简单演示

`docker-compose-2.yaml`

```yaml
version: '3'

services:
  prometheus-2:
    # Prometheus版本要 > v2.25.0
    image: prom/prometheus
    container_name: prometheus-2
    hostname: prometheus
    user: root
    restart: always
    volumes:
      # 配置
      - /root/prometheus-2/conf:/etc/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yaml'
```

配置文件：`/root/prometheus-2/conf/prometheus.yaml`

```yaml
global:
  scrape_interval:     30s
  scrape_timeout:      15s
  evaluation_interval: 30s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
        labels:
          instance: prometheus-2
```

启动

```sh
docker compose -f docker-compose-2.yaml up -d
```

![image-20240612153353914](C:\Users\Frank\AppData\Roaming\Typora\typora-user-images\image-20240612153353914.png)