---
title: LVM逻辑卷 SSD作为HDD缓存
published: 2024-06-18
tags: [lvm]
category: 技术分享
draft: false
image: https://api.miaomc.cn/image/get?26
---

## LVM逻辑卷 SSD作为HDD缓存

vdb、vdc作为数据盘，vdd作为缓存盘

![image-20240618093038353](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618093038353.png)	

测试3个盘的读写速率

```sh
# 测试读速率
fio -filename=/dev/vdb -direct=1 -iodepth 1 -thread -rw=read -ioengine=psync -bs=4k -size=200G -numjobs=10 -runtime=60 -group_reporting -name=mytest
```

![image-20240618094940751](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618094940751.png)

![image-20240618095134233](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618095134233.png)

```sh
# 测试写速率
fio -filename=/dev/vdb -direct=1 -iodepth 1 -thread -rw=randwrite -ioengine=psync -bs=4k -size=20G -numjobs=10 -runtime=60 -group_reporting -name=mytest
```

![image-20240618095342953](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618095342953.png)

![image-20240618095505038](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618095505038.png)

vdb、vdc、vdd进行分区

分区

![image-20240618093524963](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618093524963.png)

查看

![image-20240618093550391](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618093550391.png)

​	

创建物理卷：vdb1、vdc1、vdd1

```sh
pvcreate /dev/vdb1 /dev/vdc1 /dev/vdd1
```

![image-20240618093722638](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618093722638.png)

创建卷组：

```sh
vgcreate vg /dev/vdb1 /dev/vdc1 /dev/vdd1
```

![image-20240618100321696](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618100321696.png)

创建逻辑卷-数据盘

```sh
lvcreate -n data -l 100%free vg /dev/vdb1 /dev/vdc1
```

![image-20240618101234540](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618101234540.png)

创建缓存逻辑卷：lvm cache总共包括三部分：data、cache、meta，其中meta的size需要大于千分之一的cache；data是存储数据，cache和meta共同构成缓存。

```sh
lvcreate -n cache -L 20G vg /dev/vdd1 
lvcreate -n meta -L 2G vg /dev/vdd1 
```

![image-20240618101537325](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618101537325.png)

未做缓存测速

![image-20240618102504777](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618102504777.png)

创建缓存池、将存储卷加入缓存池

```sh
lvconvert --type cache-pool --poolmetadata vg/meta vg/cache
lvconvert --type cache --cachepool vg/cache --cachemode writeback vg/data
```

![image-20240618101729601](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618101729601.png)

测速

![image-20240618102752648](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240618102752648.png)

其他：

```sh
# 格式化
mkfs.xfs /dev/vg/data 
# 挂载
mkdir /data
mount /dev/vg/data /data
```

