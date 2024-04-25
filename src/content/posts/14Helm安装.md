---
title: 安装Helm
published: 2024-04-25
tags: [helm]
image: https://api.miaomc.cn/image/get?14
category: 安装教程
draft: false
---



1. 查看helm版本与K8S对应关系：https://helm.sh/zh/docs/topics/version_skew/

2. 下载所需版本：https://github.com/helm/helm/releases

   ![image](https://zwx-blog-oss.oss-cn-hangzhou.aliyuncs.com/blog/helm.png)	

3. 安装

   ```sh
   wget https://get.helm.sh/helm-v3.11.3-linux-amd64.tar.gz
   tar -zxvf helm-v3.11.3-linux-amd64.tar.gz
   mv linux-amd64/helm /usr/local/bin/helm
   ```

4. 命令补全

   ```sh
   yum install bash-completion -y
   
   ! grep -q bash_completion "$HOME/.bashrc" && echo "source /usr/share/bash-completion/bash_completion" >>"$HOME/.bashrc"
   ! grep -q helm "$HOME/.bashrc" && echo "source <(helm completion bash)" >>"$HOME/.bashrc"
   
   source "$HOME/.bashrc"
   ```