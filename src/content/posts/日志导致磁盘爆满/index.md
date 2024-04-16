---
title: 磁盘爆满及解决
published: 2024-04-16
description: 日志文件过大导致磁盘爆满
tags: [Git, GitHub]
image: ./排查1.png
category: 迎刃而解
draft: false
---

# 日志导致磁盘爆满

1. Jenkins打包报错

   ![报错](报错.png)	

2. 由于Jenkins数据在data目录下，但/目录占用100%，所以怀疑是日志占用

   ![排查1](排查1.png)	

3. 寻找占用大的目录

   ![test image size](排查2.png)

   果然，log占用29G，openvpn.log占用26G

   ![排查3](排查3.png)	

5. 删除文件

   ```sh
   # 删除文件时，建议使用 cat /dev/null > 方式进行删除，不建议使用 rm。使用 rm 方式删除的文件，可能不能被对应服务进程释放掉，该文件所占用的空间也就不会被释放。
   > cat /dev/null > openvpn.log
   ```

- `<img>`标签添加图片
<img src="https://ucc.alicdn.com/images/user-upload-01/98ceaf6910c441d6b18ac3565cbb82b8.png" alt="这是一张摩托车图片">
- `alt`属性 - 这里图片链接错误，图片无法载入，所以显示了`alt`属性的文本
<img src="https://ucc.alicdn.com/images/user-upload-01/" alt="这是一张摩托车图片">
- `height、width`属性 - 指定宽高为150
<img src="https://ucc.alicdn.com/images/user-upload-01/98ceaf6910c441d6b18ac3565cbb82b8.png" width=150 height=150>
- `<div>` 标签的`align`属性 - 使图片和文本居中，左对齐`left`，右对齐`right`
<div align=center>
<img src="https://ucc.alicdn.com/images/user-upload-01/98ceaf6910c441d6b18ac3565cbb82b8.png">
<br>摩托车图片</div>

- 下图是居中显示-图片默认插入方式
![图片描述](https://ucc.alicdn.com/images/user-upload-01/98ceaf6910c441d6b18ac3565cbb82b8.png#pic_center)
- 下图是左对齐显示
![图片描述](https://ucc.alicdn.com/images/user-upload-01/98ceaf6910c441d6b18ac3565cbb82b8.png#pic_left)
- 下图是右对齐显示
![图片描述](https://ucc.alicdn.com/images/user-upload-01/98ceaf6910c441d6b18ac3565cbb82b8.png#pic_right)

