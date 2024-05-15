---
title: MySQL数据使用软链接
published: 2024-05-15
tags: [MySQL]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?20
---

## 场景

> mysql存储空间不够，迁移数据到数据盘，使用软链接指向配置的数据目录

## 操作

停止 mysqld

```sh
systemctl status mysqld.service
systemctl stop mysqld
```

查看数据目录所在位置

```sh
cat /etc/my.cnf
----------------------
[mysqld]
datadir=/var/lib/mysql
----------------------
```

数据迁移到 `/data` 目录下

```sh
mv /var/lib/mysql /data
```

创建软链接

```sh
# 注2个mysql后面不要带/
ln -s /data/mysql /var/lib/mysql
```

查看软链接

```sh
[root@k8s-master data]# ll /var/lib
lrwxrwxrwx. 1 root    root      11 5月  15 08:58 mysql -> /data/mysql
```

赋予mysql用户和组权限

```sh
chown -R mysql:mysql /data/mysql
chown -R mysql:mysql /var/lib/mysql
```

启动

```sh
systemctl restart mysqld.service
```

如果赋予权限后重启失败

![image-20240515090434091](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240515090434091.png)

解决方法：需要关闭selinux

```sh
setenforce 0
```

