---
title: 源码安装Redis
published: 2024-04-17
tags: [Redis, 源码安装, CentOS7]
category: 安装教程
draft: false
---

### 安装依赖

```sh
yum install -y gcc tcl make
```

### 下载安装包

地址：`https://download.redis.io/releases/`

这里下载 `redis-7.0.4.tar.gz`

### 解压

```sh
tar -zxvf redis-7.0.4.tar.gz
```

### 安装

```sh
# 进入解压后 redis 目录
cd redis-7.0.4/
# 编译构建软件
make
# 安装到指定目录
make install PREFIX=/usr/local/redis 
```

### 修改redis.conf

```sh
# 将 redis-7.0.4/redis.conf 复制一份到 /usr/local/redis 下
cp redis.conf /usr/local/redis/redis.conf
```

修改redis.conf内容：

- 修改:允许所有IP访问

  ```sh
  #bind 127.0.0.1 -::1
  bind 0.0.0.0 -::1
  ```

- 修改:关闭保护模式

  ```sh
  #protected-mode yes
  protected-mode no
  ```

- 修改: 设置为后台运行

  ```sh
  #daemonize no
  daemonize yes
  ```

- 修改: 设置密码

  ```sh
  #requirepass foobared
  requirepass 123456
  ```

- 修改: 指定本地数据库存放目录

  ```sh
  #dir ./
  dir /usr/local/redis
  ```

### 配置系统服务

```sh
vi /etc/systemd/system/redis.service
```

内容：

```
[Unit]
Description=redis.server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/redis/bin/redis-server /usr/local/redis/redis.conf
Restart=always
# 在重新启动前等待 5 秒
RestartSec=5 

[Install]
WantedBy=multi-user.target
```

### 启动服务

```sh
# 重新加载 systemd 守护程序配置
systemctl daemon-reload
# 设置开机自启并立即启动
systemctl enable --now redis.service
# 查看状态
systemctl status redis
```

### 测试

```sh
> /usr/local/redis/bin/redis-cli 
127.0.0.1:6379> get a
(error) NOAUTH Authentication required.
127.0.0.1:6379> auth 密码
OK
127.0.0.1:6379> get a
(nil)
```

