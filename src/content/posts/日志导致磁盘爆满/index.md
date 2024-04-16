---
title: 磁盘爆满及解决
published: 2024-04-16
description: 日志文件过大导致磁盘爆满
tags: [Git, GitHub]
image: ./报错.png
category: 迎刃而解
draft: false
---

# 日志导致磁盘爆满

1. Jenkins打包报错

   ![image-20240415185157423](报错.png)	

2. 由于Jenkins数据在data目录下，但/目录占用100%，所以怀疑是日志占用

   ![image-20240415185108795](C:\Users\Frank\AppData\Roaming\Typora\typora-user-images\image-20240415185108795.png)	

3. 寻找占用大的目录

   <img src="C:\Users\Frank\AppData\Roaming\Typora\typora-user-images\image-20240415185353337.png" alt="image-20240415185353337" style="zoom:67%;" />	

   果然，log占用29G，openvpn.log占用26G

   ![image-20240415185514907](C:\Users\Frank\AppData\Roaming\Typora\typora-user-images\image-20240415185514907.png)	

4. 删除文件

   ```sh
   # 删除文件时，建议使用 cat /dev/null > 方式进行删除，不建议使用 rm。使用 rm 方式删除的文件，可能不能被对应服务进程释放掉，该文件所占用的空间也就不会被释放。
   > cat /dev/null > openvpn.log
   ```

   

