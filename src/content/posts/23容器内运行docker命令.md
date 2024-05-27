---
title: 容器里运行docker命令
published: 2024-05-28
description: docker 容器里运行docker命令, 以jenkins镜像为例
tags: [docker]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?23
---

## 环境准备

### 安装docker

```sh
# 卸载旧版本 Docker
yum -y remove docker \
        docker-client \
        docker-client-latest \
        docker-common \
        docker-latest \
        docker-latest-logrotate \
        docker-logrotate \
        docker-engine
        
# 设置镜像源
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo

yum install docker-ce -y
```

```sh
vi /etc/docker/daemon.json
-------------------------------
{
  "data-root": "/data/docker",
    
  "exec-opts": ["native.cgroupdriver=systemd"],	
  
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
    
  "registry-mirrors": ["https://b9pmyelo.mirror.aliyuncs.com","https://hub-mirror.c.163.com"],
    
  "storage-driver": "overlay2",

  "live-restore": true,

  "log-driver": "json-file",
  "log-opts": {"max-size": "500m", "max-file": "3"}
}
-------------------------------
systemctl daemon-reload && systemctl enable docker && systemctl start docker
docker info
```

### Jenkins镜像

> 本人选择镜像: jenkins/jenkins:2.423-jdk11

```sh
docker pull jenkins/jenkins:2.423-jdk11
```

## docker in docker

> 直接在 docker 容器内嵌套安装 docker
>
> 缺陷：
>
> 1. 启动容器后需要 `su root` 后执行 `sudo service docker start` 手动启动docker
> 2. 太过臃肿, 以特权模式启动，这种嵌套会带来潜在的安全风险

```dockerfile
FROM jenkins/jenkins:2.423-jdk11

USER root

# 替换apt源为阿里云源
RUN sed -i 's|http://deb.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources 

# 更新和安装必需的软件包
RUN apt-get update && \
    apt-get install -y sudo lsb-release apt-transport-https ca-certificates curl software-properties-common

# 配置阿里云的Docker源
RUN curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/debian $(lsb_release -cs) stable"

# 安装Docker
RUN apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io

# 设置 root 用户密码
RUN echo "root:123456" | chpasswd

# jenkins加入docker组
RUN usermod -aG docker jenkins

USER jenkins
```

```sh
docker build -t jenkins:test .
docker run --name=jenkins -itd --privileged -p 8080:8080 -p 50000:50000 jenkins:test

[root@VM-0-2-centos ~]# docker exec -it jenkins bash
jenkins@7def54fad8bc:/$ docker ps
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
jenkins@7def54fad8bc:/$ su root
Password: 
root@7def54fad8bc:/# sudo service docker start
Starting Docker: docker.
root@7def54fad8bc:/# exit
exit
jenkins@7def54fad8bc:/$ docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

## Docker outside of Docker

> 使用时用户关注的是 C 端，而生命周期的管理在 S 端
>
> cli在容器内，服务端在宿主机

```yaml
mkdir /data/jenkins_home
chown -R 1000:1000 /data/jenkins_home

docker run \
  --name=jenkins \
  -itd \
  -p 8080:8080 \
  -p 50000:50000 \
  -e JAVA_OPTS=-Duser.timezone=Asia/Shanghai \
  -v /data/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  registry.cn-hangzhou.aliyuncs.com/kongxin/jenkins:jenkins-jdk8
 
# 可选(未测试)
  -v /etc/docker/daemon.json:/etc/docker/daemon.json \
```

制作镜像过程

`Dockerfile`

```dockerfile
FROM jenkins/jenkins:2.423-jdk11

USER root

# 安装jdk8
RUN curl -o jdk.tar.gz https://zwxkx.oss-cn-hangzhou.aliyuncs.com/%E5%B7%A5%E4%BD%9C/OpenJDK8U-jdk_x64_linux_8u342b07.tar.gz && \
  tar -zxvf jdk.tar.gz -C /usr/local && \
  rm -rf jdk.tar.gz

#USER jenkins
```

```
docker build -t registry.cn-hangzhou.aliyuncs.com/kongxin/jenkins:jenkins-jdk8 .
```

