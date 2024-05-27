---
title: ansible 学习笔记(一半)
published: 2024-05-27
tags: [ansible]
category: 笔记
draft: false
image: https://api.miaomc.cn/image/get?22
---

> 由于急用, 只记录到playbook, 如role角色等未记录

## 安装

### Centos

```bash
yum install -y epel-release
yum install -y ansible
```

## 快速入门

### 免密登录配置

```bash
# 操作在Master主机上进行，一路回车
[root@vm01 ~]# ssh-keygen -t rsa

# 配置公钥到其他节点，输入对方用户名(这里以root为例)和密码即可完成从vm01到vm02的免密访问
[root@vm01 ~]# ssh-copy-id root@vm02

# 配置ssh本地免密
[root@vm01 ~]# cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

### 修改ansible配置文件

```bash
vi /etc/ansible/hosts 
# 添加连接的主机
----------------
172.16.21.127
172.16.21.181
172.16.21.182
172.16.21.183
172.16.21.184
172.16.21.195
172.16.21.196
172.16.21.197
----------------
```

### 测试

```bash
[root@k8s-master ~]# ansible all -m ping
172.16.21.182 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python"
    }, 
    "changed": false, 
    "ping": "pong"
}
.....
[root@k8s-master ~]# ansible all -a "/bin/echo hello"
172.16.21.182 | CHANGED | rc=0 >>
hello
172.16.21.181 | CHANGED | rc=0 >>
hello
......
```

## Inventory文件

### 主机和组

/etc/ansible/hosts

```bash
k8s-master  ansible_connection=local

#方括号[]中是组名,用于对系统进行分类
[k8s]
172.16.21.181
# 选择连接类型和用户名
172.16.21.182  ansible_connection=ssh  ansible_ssh_user=test
# 相似主机名简写 k8s-node3、k8s-node4...
k8s-node[3:7]

[dbservers]
# 端口号不是默认设置时,可显性表示
172.16.20.140:2222
db-[c:f]


# 组的变量
[k8s:vars]
ansible_ssh_port=22
ansible_ssh_user=root
```

### 分文件定义Host和Group变量

文件格式为`yaml`

例子：主机名为`foosball`属于两个组：`raleigh`,`webservers`，配置文件为`foosball`

```bash
/etc/ansible/group_vars/raleigh
------------------
# 配置案例(yaml格式)
ntp_server: acme.example.org
database_server: storage.example.org
------------------
/etc/ansible/group_vars/webservers
/etc/ansible/host_vars/foosball
```

在进一步

```bash
# 分别设置不同类型的变量
/etc/ansible/group_vars/raleigh/db_settings
/etc/ansible/group_vars/raleigh/cluster_settings
```

### Inventory参数的说明

```yaml
ansible_ssh_host: 将要连接的远程主机名.与你想要设定的主机的别名不同的话,可通过此变量设置.

ansible_ssh_port: ssh端口号.如果不是默认的端口号,通过此变量设置.

ansible_ssh_user: 默认的 ssh 用户名

ansible_ssh_pass: ssh 密码(这种方式并不安全,我们强烈建议使用 --ask-pass 或 SSH 密钥)

ansible_sudo_pass: sudo 密码(这种方式并不安全,我们强烈建议使用 --ask-sudo-pass)

ansible_sudo_exe (new in version 1.8): sudo 命令路径(适用于1.8及以上版本)

ansible_connection: 与主机的连接类型.比如:local, ssh 或者 paramiko. Ansible 1.2 以前默认使用 paramiko.1.2 以后默认使用 'smart','smart' 方式会根据是否支持 ControlPersist, 来判断'ssh' 方式是否可行.

ansible_ssh_private_key_file: ssh 使用的私钥文件.适用于有多个密钥,而你不想使用 SSH 代理的情况.

ansible_shell_type: 目标系统的shell类型.默认情况下,命令的执行使用 'sh' 语法,可设置为 'csh' 或 'fish'.

ansible_python_interpreter: 目标主机的 python 路径
	适用于的情况: 系统中有多个 Python, 或者命令路径不是"/usr/bin/python",比如 /data/python3
    			不是 2.X 版本的 Python, 不使用 "/usr/bin/env" 机制,因为这要求远程用户的路径设置正确,且要求 "python" 可执行程序名不可为 python以外的名字(实际有可能名为python26).
				与 ansible_python_interpreter 的工作方式相同,可设定如 ruby 或 perl 的路径....
```

## Patterns(表达式)

一个pattern通常关联到一系列组(主机的集合) 

```bash
# Inventory文件内容
[master]
k8s-master

[node]
k8s-node[1:7]
```

```bash
# 表示仓库(inventory)中的所有机器
all
*

# 测试
ansible all -m ping
```

```bash
# 如下patterns分别表示一个或多个groups, 多组之间以冒号分隔表示或的关系, 这意味着一个主机可以同时存在多个组:
webservers
webservers:dbservers

# 测试
ansible master -m ping
ansible master:node -m ping
```

```bash
# 排定一个特定组

# 执行命令有机器需要隶属于 g1 或 g2
g1:g2
# 执行命令有机器需要同时隶属于 g1 和 g2
g1:&g2
# 执行命令的机器必须隶属 g1 组但不在 g2 组:
g1:!g2
```

```bash
# 可以不必严格定义groups,单个的host names, IPs , groups都支持通配符:
# 如
k8s-node*
k8s-*:g1
```

```bash
# 支持正则，只需要以 ~ 开头即可
~^k8s-[mn].*[1-3]$

# ping k8s-master1、k8s-master2、k8s-node1、k8s-node2
ansible ~^k8s-[mn].*[1-2]$ -m ping
```

## ad-hoc(命令行)

```bash
# 教程：https://blog.csdn.net/Kangshuo2471781030/article/details/82733074
ansible <host-pattern> [options]
```

`-v，--verbose：输出更详细的执行过程信息，-vvv可得到执行过程所有信息`

```bash
[root@k8s-master ~]# ansible master -m command -a 'pwd' -v
Using /etc/ansible/ansible.cfg as config file
k8s-master | CHANGED | rc=0 >>
/root
```

`-i，PATH，--inventory（清单）=PATH：指定inventory（清单）信息，默认/etc/ansible/hosts`

```bash

```

`-f NUM，--forks=NUM：并发线程数(每次do几个)，默认5个线程`

```bash
# 每次进行2个节点的ping操作
[root@k8s-master ~]# ansible node -f 2 -m ping 
```

`--private-key=PRIVATE_KEY_FILE：指定密钥文件`

```bash

```

`-m NMAE，--module-name=NAME：指定执行使用的模块`

```bash
# 常用模块：https://www.cnblogs.com/keerya/p/7987886.html

[root@server ~]# ansible-doc
Usage: ansible-doc [options] [module...]
Options:
  -h, --help            show this help message and exit　　# 显示命令参数API文档
  -l, --list            List available modules　　#列出可用的模块
  -M MODULE_PATH, --module-path=MODULE_PATH　　#指定模块的路径
                        specify path(s) to module library (default=None)
  -s, --snippet         Show playbook snippet for specified module(s)　　#显示playbook制定模块的用法
  -v, --verbose         verbose mode (-vvv for more, -vvvv to enable　　# 显示ansible-doc的版本号查看模块列表：
                        connection debugging)
  --version             show program's version number and exit

ansible-doc -l			    #获取全部模块的信息
ansible-doc -s MOD_NAME		#获取指定模块的使用帮助
```

`-M DIRECTORY，--module-path=DIRECTORY：指定模块存放路径，默认/usr/share/ansible,也可以通过ANSIBLE_LIBRARY设定默认路径`

```bash

```

`-a ‘ARGUMENTS’，--args=‘ARGUMENTS’：模块参数`

```bash

```

`-k，--ask-pass SSH：认证密码`

```bash

```

`-K，--ask-sudo-pass sudo：用户的密码（-s/--sudo时使用）`

```bash

```

`-o，--one-line：标准输出至一行`

```bash
[root@k8s-master ~]# ansible master -m ping -o
k8s-master | SUCCESS => {"ansible_facts": {"discovered_interpreter_python": "/usr/bin/python"}, "changed": false, "ping": "pong"}
```

`-s，--sudo：相当于Linux系统下的sudo命令`

```bash

```

`-t DIRECTORY，--tree=DIRECTORY：输出信息至DIRECTORY目录下，结果文件以远程主机命名`

```bash

```

`-T SECONDS，--timeout=SECONDS：指定连接远程主机的最大超时，单位是秒`

```bash

```

`-B NUM，--background=NUM：后台执行命令，超NUM秒后中止正在执行的任务`

```bash

```

`-P NUM，--poll=NUM：定期返回后台任务进度`

```bash

```

`-u USERNAME，--user=USERNAME：指定远程主机以USERNAME运行命令`

```bash
ansible master -m ping -u test   # 指定用户执行
```

`-U SUDO_USERNAME，--sudo-user=SUDO_USERNAME：使用sudo，相当于LInux下的sudo命令`

```bash

```

`-c CONNECTION，--connection=CONNECTION：指定连接方式，可用选项paramiko（SSH）、ssh、local，local方式常用于crontab和kickstarts`

```bash

```

`-l  SUBSET，--limit=SUBSET：指定运行主机`

```bash

```

`-l ~REGEX，--limit=~REGEX：指定运行主机（正则）`

```bash

```

`--list-hosts：列出符合条件的主机列表，不执行任何命令`

```bash
[root@k8s-master ~]# ansible all --list-hosts
  hosts (8):
    k8s-node1
    k8s-node2
    k8s-node3
    k8s-node4
    k8s-node5
    k8s-node6
    k8s-node7
    k8s-master
```

## Ansible配置文件

ansible配置读取的顺序，配置不会被叠加:

```
* ANSIBLE_CONFIG (一个环境变量)
* ansible.cfg (位于当前目录中)
* .ansible.cfg (位于家目录中)
* /etc/ansible/ansible.cfg
```

ansible.cfg的配置默认分为八段：

- [defaults]：通用配置项
- [inventory]：与主机清单相关的配置项
- [privilege_escalation]：特权升级相关的配置项
- [paramiko_connection]：使用paramiko连接的相关配置项，Paramiko在RHEL6以及更早的版本中默认使用的ssh连接方式
- [ssh_connection]：使用OpenSSH连接的相关配置项，OpenSSH是Ansible在RHEL6之后默认使用的ssh连接方式
- [persistent_connection]：持久连接的配置项
- [accelerate]：加速模式配置项
- [selinux]：selinux相关的配置项
- [colors]：ansible命令输出的颜色相关的配置项
- [diff]：定义是否在运行时打印diff（变更前与变更后的差异）

配置参数：http://ansible.com.cn/docs/intro_configuration.html#environmental-configuration

## Palybooks

### 基础

```yaml
---
  # hosts 行的内容是一个或多个组或主机的patterns
- hosts: master,node
  # remote_user 用户名
  remote_user: root
  
```

https://www.cnblogs.com/yanjieli/p/10969299.html