---
title: 建立swap分区并挂载
published: 2024-04-24
tags: [swap, 磁盘 , CentOS7]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?13
---


> 当物理内存不够，就把该分区当做`虚拟内存`来使用
>
> 案例：
>
> 把 vdb 进行分区, vdb1瓜分5G作为交换分区使用 

## 磁盘分区

查看物理磁盘：`lsblk`

![image-20240424142530453](image-20240424142530453.png)	

进行分区：`fdisk /dev/vdb`

![image-20240424143141322](image-20240424143141322.png)	

再次查看物理磁盘

![image-20240424143242825](image-20240424143242825.png)	

查看分区类型

![image-20240424145634966](image-20240424145634966.png)	

修改分区类型

![image-20240424145729196](image-20240424145729196.png)	

再次查看分区类型

![image-20240424145917439](image-20240424145917439.png)		

## 格式化分区

`mkswap /dev/vdb1` 

![image-20240424143506033](image-20240424143506033.png)	

## swap挂载

永久挂载：

```sh
vim /etc/fstab
------------------------------------
UUID=c4bd57c9-0fdb-436c-97ad-bb1efe65c878  swap  swap  defaults  0  0
------------------------------------
```

临时挂载：`swapon /dev/vdb1`

![image-20240424143614646](image-20240424143614646.png)	

查看挂载：`swapon -s`

![image-20240424150321168](image-20240424150321168.png)	

删除挂载：`swapoff /dev/vdb1` 

![image-20240424150359326](image-20240424150359326.png)	