---
title: 安装Nacos
published: 2024-05-08
description: Centos7安装Nacos v2.2.3
tags: [Nacos, CentOS7]
category: 安装教程
draft: false
image: https://api.miaomc.cn/image/get?18
---

## 先前条件

- 2C4G 60G
- 64 bit OS，支持 Linux/Unix/Mac/Windows，推荐选用 Linux/Unix/Mac
- 64 bit JDK 1.8+：安装参考 [点我](https://zwxzxz.github.io/posts/17%E5%AE%89%E8%A3%85jdk/)

## 安装

下载编译后压缩包：https://github.com/alibaba/nacos/releases

解压

```sh
# -C: 指定解压缩的目标目录
tar -zxvf nacos-server-2.2.3.tar.gz -C /data/
```

修改配置文件

```sh
vim /data/nacos/conf/application.properties
------------------------------
# 使用mysql数据库存储配置如下
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://192.168.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=nacos
db.password.0=nacos

# 开启 prometheus 监控指标: /nacos/actuator/prometheus
management.endpoints.web.exposure.include=*

# 修改tomcat日志存储目录
server.tomcat.basedir=file:/data/nacos/tomcat
------------------------------
```

测试运行

```sh
# 单机启动
sh bin/startup.sh -m standalone

# 关闭
sh bin/shutdown.sh
```

设置systemctl service

```sh
vim /etc/systemd/system/nacos.service
------------------------------
[Unit]
Description=nacos
After=network.target

[Service]
# 添加java的环境变量, 在systemctl中不会读取profile环境变量, 必须明确指定
Environment="JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.412.b08-1.el7_9.x86_64/jre"
Type=forking
ExecStart=/data/nacos/bin/startup.sh -m standalone
ExecStop=/data/nacos/bin/shutdown.sh
# 分配独立空间
PrivateTmp=true
Restart=always
# 在重新启动前等待 5 秒
RestartSec=5 

[Install]
WantedBy=multi-user.target
------------------------------

systemctl restart nacos.service
systemctl enable nacos.service
```

