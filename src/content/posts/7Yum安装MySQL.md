---
title: Yum安装MySQL
published: 2024-04-17
tags: [MySQL, Yum安装, CentOS7]
category: 安装教程
draft: false
image: https://api.miaomc.cn/image/get?7
---

## 卸载mariadb

列出安装的mariadb rpm 包

```sh
rpm -qa | grep mariadb
```

卸载

```
rpm -e --nodeps mariadb-libs
```

## 安装MySQL源

下载 MySQL 源安装包：[MySQL Yum Repository](https://dev.mysql.com/downloads/repo/yum/)

> mysql80-community-release-el7-8.noarch.rpm
>
> 简要说明：
>
> mysql80：标识 MySQL8.0版本的配置包
> 
> community-release：表明这是 MySQL 社区版的发布包，非商业版
> 
> el7：代表这个包适用于基于 Red Hat Enterprise Linux 7 或与其兼容的操作系统，比如 CentOS 7
> 
> 11：可能是该配置包的版本号
> 
> noarch：表示这是一个与架构无关的包，也就是说它可以在任意 CPU 架构的 CentOS 7 系统上安装

```sh
wget http://dev.mysql.com/get/mysql80-community-release-el7-11.noarch.rpm
```

> 上面命令执行后，会在当前目录下查看已下载的安装包 mysql80-community-release-el7-11.noarch.rpm

安装 MySQL 源

```sh
yum localinstall -y mysql80-community-release-el7-11.noarch.rpm
```

检查源是否安装成功

```sh
yum repolist enabled | grep mysql8
------------------------------
mysql80-community/x86_64             MySQL 8.0 Community Server              465
------------------------------
```

或使用国内源参考：https://mirrors.tuna.tsinghua.edu.cn/help/mysql/

## 安装MySQL

```sh
yum install -y \
mysql-community-client-plugins-8.0.28 \
mysql-community-common-8.0.28 \
mysql-community-libs-8.0.28 \
mysql-community-client-8.0.28 \
mysql-community-icu-data-files-8.0.28 \
mysql-community-server-8.0.28 
```

**注**：安装报错：由于GPG密钥验证问题

```
The GPG keys listed for the "MySQL 8.0 Community Server" repository are already installed but they are not correct for this package.
Check that the correct key URLs are configured for this repository.

 Failing package is: mysql-community-client-8.0.36-1.el7.x86_64
 GPG Keys are configured as: file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql-2022, file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
```

解决：

```sh
# --nogpgcheck: 禁用GPG验证检查
yum -y install --nogpgcheck 
```

执行完成后，检查是否安装完成

```sh
rpm -qa | grep mysql
------------------------------
mysql-community-client-8.0.28-1.el7.x86_64
mysql-community-libs-compat-8.0.36-1.el7.x86_64
mysql80-community-release-el7-11.noarch
mysql-community-common-8.0.28-1.el7.x86_64
mysql-community-libs-8.0.28-1.el7.x86_64
mysql-community-icu-data-files-8.0.28-1.el7.x86_64
mysql-community-server-8.0.28-1.el7.x86_64
mysql-community-client-plugins-8.0.28-1.el7.x86_64
------------------------------
```

## 启动MySQL

开机自启且立即启动

```sh
systemctl enable --now mysqld
systemctl daemon-reload
```

## 登录MySQL

查看初始密码

```sh
cat /var/log/mysqld.log | grep password
```

登录，输入密码(最好别直接跟在 -p 后，防止泄露)

```sh
mysql -uroot -p
```

修改密码：包含数字、大小写字母、特殊字符、长度8位

```mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码';
```

设置远程连接

```sh
use mysql;
update user set host='%' where user='root';
flush privileges;
```

## 调优MySQL

> 修改 `/etc/my.cnf` 文件

修改最大连接数

```mysql
# 查看最大连接数: 默认151
SHOW VARIABLES LIKE 'max_connections';
```

```
[mysqld]
max_connections = 1000
```

修改字符集和排序规则

```
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
```

修改数据包大小：客户端和服务器一次通信中允许传输的数据包最大值

```mysql
# 查看可接受最大数据包大小: 67108864 == 64M
show VARIABLES like 'max_allowed_packet%'; 
```

```
[mysqld]
max_allowed_packet = 200M
```

InnoDB的缓冲池大小：物理内存的一半

```
[mysqld]
innodb_buffer_pool_size=4GB
```

事务提交时的日志刷新行为：=2事务提交时，InnoDB 将日志缓冲区的日志刷新到磁盘上的日志文件，但不需要等待操作系统将日志文件写入磁盘

```
[mysqld]
innodb_flush_log_at_trx_commit=2
```

每10次SQL/事务触发io

```
[mysqld]
sync_binlog=10
```

## MySQL 常用查询

查看当前连接数

```mysql
SHOW STATUS LIKE 'Threads_connected';
```

