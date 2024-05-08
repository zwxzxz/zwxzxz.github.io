---
title: 安装JDK
published: 2024-05-08
description: Centos7安装jdk8/11/17
tags: [JDK, CentOS7]
category: 安装教程
draft: false
image: https://api.miaomc.cn/image/get?17
---

## JDK8

安装

```sh
yum list java*
yum install -y java-1.8.0-openjdk.x86_64
```

设置环境变量(JAVA_HOME)

```sh
vi /etc/profile
-------------------------------
# 注意版本路径可能不一致
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.412.b08-1.el7_9.x86_64/jre
export PATH=$JAVA_HOME/bin:$PATH
-------------------------------
source /etc/profile

java -version
```

## JDK11

安装

```sh
yum list java*
yum install java-11-openjdk.x86_64
```

设置环境变量(JAVA_HOME)

```sh
vi /etc/profile
-------------------------------
# 注意版本路径可能不一致
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-11.0.23.0.9-2.el7_9.x86_64
export PATH=$JAVA_HOME/bin:$PATH
-------------------------------
source /etc/profile

java -version
```

## JDK17

centos7.9 yum安装不了jdk17，使用二进制包安装

```sh
wget https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz

tar zxf jdk-17_linux-x64_bin.tar.gz
rm -rf jdk-17_linux-x64_bin.tar.gz
mv jdk-17.0.8 jdk-17

mv jdk-17 /usr/local/

vi /etc/profile
-------------------------------
export JAVA_HOME=/usr/local/jdk-17
export PATH=$JAVA_HOME/bin:$PATH
-------------------------------
source /etc/profile

java -version
```



附：[yum卸载jdk](https://blog.csdn.net/qq_41995299/article/details/105497615)