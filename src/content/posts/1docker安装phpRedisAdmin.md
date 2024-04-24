---
title: 安装phpRedisAdmin
published: 2024-04-13
tags: [phpRedisAdmin, docker, docker-compose]
image: https://api.miaomc.cn/image/get?1
category: 安装教程
draft: false
---

## Docker-compose安装

创建docker-compose文件: phpRedisAdmin.yml

```yaml
version: '3'
services:
  phpredisadmin:
    image: erikdubbelboer/phpredisadmin
    container_name: phpredisadmin
    ports:
      - "80:80"
    environment:
      - REDIS_1_NAME=redis        # redis名称(自定义)
      - REDIS_1_HOST=192.168.0.1  # redis地址
      - REDIS_1_PORT=6379         # redis端口
      - REDIS_1_AUTH=123456       # redis密码(需要认证需提供)
      - ADMIN_USER=admin          # phpredisadmin登录用户名
      - ADMIN_PASS=admin          # phpredisadmin登录密码
    restart: always
```

启动

```sh
# -d: 后台启动
docker-compose -f phpRedisAdmin.yml up -d
```

删除

```sh
docker-compose -f phpRedisAdmin.yml down
```

## Docker安装

```sh
docker run -itd \
-e REDIS_1_NAME=MyRedis \
-e REDIS_1_HOST=192.168.0.1 \
-e REDIS_1_PORT=6379 \
-e REDIS_1_AUTH=123456 \
-e ADMIN_USER=admin \
-e ADMIN_PASS=admin \
-p 80:80 erikdubbelboer/phpredisadmin
```
