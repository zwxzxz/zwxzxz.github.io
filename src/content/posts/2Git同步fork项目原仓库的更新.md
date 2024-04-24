---
title: Git同步fork项目原仓库的更新
published: 2024-04-15
tags: [Git]
category: 迎刃而解
draft: false
image: https://api.miaomc.cn/image/get?2
---

1. 查看当前仓库配置的远程仓库

   ```sh
   > git remote -v
   
   origin  https://github.com/zwxzxz/zwxzxz.github.io.git (fetch)
   origin  https://github.com/zwxzxz/zwxzxz.github.io.git (push)
   ```

2. 指明需要同步的他人仓库

   ```sh
   git remote add upstream https://github.com/saicaca/fuwari.git
   ```

3. 再次查看当前仓库配置的远程仓库

   ```sh
   > git remote -v
   
   origin  https://github.com/zwxzxz/zwxzxz.github.io.git (fetch)
   origin  https://github.com/zwxzxz/zwxzxz.github.io.git (push)
   upstream        https://github.com/saicaca/fuwari.git (fetch)
   upstream        https://github.com/saicaca/fuwari.git (push)
   ```

4. 获取远程仓库 upstream 最新的更改

   ```sh
   > git fetch upstream
   
   remote: Enumerating objects: 1079, done.
   remote: Compressing objects: 100% (78/78), done.
   remote: Total 1079 (delta 202), reused 169 (delta 169), pack-reused 832Receiving objects: 100% (1079/1079), 2.87 MiB | 2.78 MiB/s, done.
   
   From https://github.com/saicaca/fuwari
    * [new branch]      demo       -> upstream/demo
    * [new branch]      main       -> upstream/main
   ```

5. 创建新分支，并切换到新分支(防止出问题，也可不用创建)

   ```sh
   # -b: 创建并切换分支
   > git checkout -b master
   ```

6. 合并他人仓库某分支到本地分支

   ```sh
   > git merge upstream/main
   ```

   

   **可能出现报错**：`fatal: refusing to merge unrelated histories`

   意味着 Git 认为两个仓库的历史没有共同的祖先，因此不允许直接合并

   解决方法

   ```sh
   > git pull upstream main --allow-unrelated-histories
   ```

7. 处理合并冲突
