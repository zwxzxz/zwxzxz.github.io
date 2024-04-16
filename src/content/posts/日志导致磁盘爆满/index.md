---
title: 磁盘爆满及解决
published: 2024-04-16
description: 日志文件过大导致磁盘爆满
tags: [磁盘, 问题, Linux]
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

   <img src="https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/image-20240415185353337.png" alt="排查2.png" style="zoom:80%;" >
   
   果然，log占用29G，openvpn.log占用26G

   ![排查3](排查3.png)

5. 删除文件

   ```sh
   # 删除文件时，建议使用 cat /dev/null > 方式进行删除，不建议使用 rm。使用 rm 方式删除的文件，可能不能被对应服务进程释放掉，该文件所占用的空间也就不会被释放。
   > cat /dev/null > openvpn.log
   ```


tice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

Tables can look like this:

size material color

---

9 leather brown
10 hemp canvas natural
11 glass transparent

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

---

keyword text

---

red Sunsets, apples, and
other red or reddish
things.

green Leaves, grass, frogs
and other things it's
not easy being.

---

A horizontal rule follows.

---

Here's a definition list:

apples
: Good for making applesauce.
oranges
: Citrus!
tomatoes
: There's no "e" in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a "line block":

| Line one
| Line too
| Line tree

and images can be specified like so:

[//]: # (![example image]&#40;./demo-banner.png "An exemplary image"&#41;)

Inline math equations go in like so: $\omega = d\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$I = \int \rho R^{2} dV$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.
