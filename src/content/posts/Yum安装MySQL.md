---
title: Yum安装MySQL
published: 2024-04-17
tags: [MySQL, Yum安装]
category: 安装教程
draft: false
---

## Yum安装MySQL

### 卸载mariadb

列出安装的mariadb rpm 包

```sh
rpm -qa | grep mariadb
```

卸载

```
rpm -e --nodeps mariadb-libs
```

### 安装MySQL源

下载 MySQL 源安装包：[MySQL Yum Repository](https://dev.mysql.com/downloads/repo/yum/)

> mysql80-community-release-el7-8.noarch.rpm
>
> 简要说明：
>
> mysql80：标识 MySQL8.0版本的配置包
> community-release：表明这是 MySQL 社区版的发布包，非商业版
> el7：代表这个包适用于基于 Red Hat Enterprise Linux 7 或与其兼容的操作系统，比如 CentOS 7
> 11：可能是该配置包的版本号
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

### 安装MySQL

```sh
yum install -y \
mysql-community-client-plugins-8.0.28 \
mysql-community-common-8.0.28 \
mysql-community-libs-8.0.28 \
mysql-community-client-8.0.28 \
mysql-community-icu-data-files-8.0.28 \
mysql-community-server-8.0.28 
```

`注`：

安装报错：由于GPG密钥验证问题

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

### 启动MySQL

开机自启且立即启动

```sh
systemctl enable --now mysqld
systemctl daemon-reload
```

### 登录MySQL

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

