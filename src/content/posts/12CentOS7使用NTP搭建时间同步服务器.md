---
title: CentOS7 使用NTP搭建时间同步服务器
published: 2024-04-22
tags: [NTP, 时间同步, CentOS7]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?12
---

> 场景：
>
> 两台CentOS服务器，其中一台是**可以连接外网**(A服务器)，另一台**不能连接外网**(B服务器)，但A服务器和B服务器在同一局域网中
>
> B服务器(192.168.0.2) --> A服务器(192.168.0.1) --> 阿里云NTP服务器

## A服务器操作

安装ntp

```sh
yum -y install ntp
```

修改ntp配置文件`/etc/ntp.conf`

```sh
cat >>/etc/ntp.conf<< EOF
# 同步阿里云NTP服务器
server ntp1.aliyun.com iburst  
server ntp2.aliyun.com iburst
server ntp3.aliyun.com iburst
server ntp4.aliyun.com iburst

# 表示自己也是一server
server 127.127.0.1
# 表示自己是一个层级比较低的服务.可以从其他服务同步时间
fudge 127.127.1.0 stratum 10

EOF
```

重新启动

```sh
systemctl restart ntpd.service
```

查看系统时间

```sh
date
```

开放防火墙端口(防火墙关闭的不用执行)

```sh
firewall-cmd --zone=public --add-port=123/udp --permanent && firewall-cmd --reload
```

## B服务器操作

安装ntp

```sh
yum -y install ntp
```

同步验证

```
ntpdate -d 192.168.0.1
```

修改配置文件

```sh
vim /etc/ntp.conf
--------------------------------
#将server 都注释掉
#只保留一条
server 192.168.0.1 iburst
--------------------------------
```

重启

```sh
systemctl restart ntpd.service
```

查看信息

```sh
> ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 192.168.0.1    169.254.0.81     3 u    4   64    3    0.231    1.920   1.022
```

