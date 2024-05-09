---
title: 安装ClickHouse
published: 2024-05-09
description: Centos7安装ClickHouse
tags: [ClickHouse, CentOS7]
category: 安装教程
draft: false
image: https://api.miaomc.cn/image/get?19
---

## 必要条件

- CPU：SSE4.2指令集的x86_64架构的CPU
- RAM：至少4GB
- SWAP：禁用交换分区
- 磁盘空间：至少2GB

## 安装

推荐使用CentOS、RedHat和所有其他基于rpm的Linux发行版的官方预编译`rpm`包。

```sh
yum install -y yum-utils
yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
# 查看可安装版本
yum list --showduplicates clickhouse-server

# 安装指定版本
export clickhouse_version=23.8.12.13
yum install -y clickhouse-server-${clickhouse_version} clickhouse-client-${clickhouse_version}

systemctl start clickhouse-server.service
systemctl enable clickhouse-server.service

clickhouse-client 
```

## 配置

`/etc/clickhouse-server/config.xml`

- 开放ipv4访问

  ```xml
      <listen_host>0.0.0.0</listen_host> 
  ```

- 开放Prometheus指标监控

  ```xml
      <prometheus>
          <endpoint>/metrics</endpoint>
          <port>9363</port>
  
          <metrics>true</metrics>
          <events>true</events>
          <asynchronous_metrics>true</asynchronous_metrics>
          <status_info>true</status_info>
      </prometheus>
  ```

- 修改时区

  ```xml
      <timezone>Asia/Shanghai</timezone>
  ```

- 防止SQL查询敏感数据泄漏到日志

  ```xml
      <query_masking_rules>
          <rule>
              <name>hide encrypt/decrypt arguments</name>
              <regexp>((?:aes_)?(?:encrypt|decrypt)(?:_mysql)?)\s*\(\s*(?:'(?:\\'|.)+'|.*?)\s*\)</regexp>
              <replace>\1(???)</replace>
          </rule>
      </query_masking_rules>
  ```

`/etc/clickhouse-server/users.xml`

- 设置`default`密码

  ```xml
              <password>123456</password>
  ```

- 创建新用户

  ```xml
      <users>
          <user1>
              <password>12345678</password>
              <networks>
                  <ip>::/0</ip>
              </networks>
          </user1>
      </users>
  ```

  