---
title: 安装 Kubernetes(1.23.x)
published: 2024-04-22
description: 安装 Kubernetes 1.23版本, 使用docker作为运行时接口
tags: [Kubernetes, docker, 单主节点, iptable, calico, CentOS7]
category: 安装教程
draft: false
image: https://api.miaomc.cn/image/get?1
---

## 安装环境准备(所有节点)

```sh
# 根据规划设置主机名
hostnamectl set-hostname master-1 && bash
hostnamectl set-hostname node-1 && bash
hostnamectl set-hostname node-2 && bash
......
```

```sh
# 配置域名解析
cat >> /etc/hosts << EOF
192.168.0.1 master-1
192.168.0.2 node-1
192.168.0.3 node-2
EOF
```

```sh
# 关闭防火墙
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```

```sh
# 关闭 selinux

# 临时
setenforce 0
# 永久
sed -i -r 's/SELINUX=[ep].*/SELINUX=disabled/g' /etc/selinux/config
# 检验
cat /etc/selinux/config
```

```sh
# 关闭swap

# 临时
swapoff -a
# 永久
sed -ri 's/.*swap.*/#&/' /etc/fstab
# 检验
cat /etc/fstab
```

```sh
#配置ulimit

ulimit -SHn 65535
cat >> /etc/security/limits.conf <<EOF
* soft nofile 655360
* hard nofile 131072
* soft nproc 655350
* hard nproc 655350
* seft memlock unlimited
* hard memlock unlimitedd
EOF
```

```sh
# 修改内核参数

cat <<EOF > /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
fs.may_detach_mounts = 1
vm.overcommit_memory=1
vm.panic_on_oom=0
fs.inotify.max_user_watches=89100
fs.file-max=52706963
fs.nr_open=52706963
net.netfilter.nf_conntrack_max=2310720

net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl =15
net.ipv4.tcp_max_tw_buckets = 36000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_max_orphans = 327680
net.ipv4.tcp_orphan_retries = 3
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.ip_conntrack_max = 65536
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.tcp_timestamps = 0
net.core.somaxconn = 16384

net.ipv6.conf.all.disable_ipv6 = 0
net.ipv6.conf.default.disable_ipv6 = 0
net.ipv6.conf.lo.disable_ipv6 = 0
net.ipv6.conf.all.forwarding = 1

EOF

# 重新加载
sysctl --system
```

```sh
# 加载网桥过滤器模块(使用iptable)

# iptable
# 开机自动启动模块
cat <<EOF | tee /etc/modules-load.d/iptables.conf
br_netfilter
overlay
ip_tables
iptable_filter
EOF

# 加载模块
modprobe br_netfilter
modprobe overlay
modprobe ip_tables
modprobe iptable_filter

# 重启系统服务
systemctl restart systemd-modules-load.service

# 验证是否生效
lsmod | grep br_netfilter \
    && lsmod | grep overlay \
    && lsmod | grep ip_tables \
    && lsmod | grep iptable_filter
```

```sh
# 将桥接的IPv4流量传递到iptables链(保证容器网络正常)
cat > /etc/sysctl.d/99-kubernetes-cri.conf << EOF
net.bridge.bridge-nf-call-ip6tables=1
net.bridge.bridge-nf-call-iptables=1
net.ipv4.ip_forward=1
EOF
# 生效
sysctl --system

# 验证是否生效,都要=1(有 =0 时, /etc/sysctl.conf文件里有相同配置=0,修改为1, 或直接/etc/sysctl.conf追加99-kubernetes-cri.conf配置内容)
sysctl net.bridge.bridge-nf-call-iptables \
	net.bridge.bridge-nf-call-ip6tables \
	net.ipv4.ip_forward
```

```sh
# 配置 NetworkManager 不接管 calico 的网卡(全节点执行)

cat <<EOF>> /etc/NetworkManager/conf.d/calico.conf
[keyfile]
unmanaged-devices=interface-name:cali*;interface-name:tunl*;interface-name:vxlan.calico;interface-name:vxlan-v6.calico;interface-name:wireguard.cali;interface-name:wg-v6.cali
EOF

systemctl restart NetworkManager
```

```sh
# 时间同步（公有云跳过）

yum install chrony -y
systemctl enable chronyd  --now
# 查看同步状态
chronyc sources
```

## 安装Docker(所有节点)

```sh
# 设置镜像源
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo

yum list docker-ce --showduplicates |sort -r
docker-ce.x86_64            3:24.0.1-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:24.0.0-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:23.0.6-1.el7                     docker-ce-stable 
...
```

```sh
# 卸载远古旧版本 Docker
yum -y remove docker \
        docker-client \
        docker-client-latest \
        docker-common \
        docker-latest \
        docker-latest-logrotate \
        docker-logrotate \
        docker-engine

# 卸载最近旧版本(没安装过不用卸载)
yum -y remove docker-ce \
      docker-ce-cli \
      containerd.io \
      docker-buildx-plugin \
      docker-compose-plugin \
      docker-ce-rootless-extras

# 删除目录(可能指定存储其他位置,没安装过不用卸载)
rm -rf /var/lib/docker
rm -rf /var/lib/containerd
```

```sh
# 安装 Docker

yum install docker-ce-24.0.0 -y

# 查看安装版本及依赖
yum list installed | grep docker

# 修改配置文件
vi /etc/docker/daemon.json
-------------------------------
{
  "data-root": "/data/docker",
    
  "exec-opts": ["native.cgroupdriver=systemd"],	
  
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
    
  "registry-mirrors": ["https://b9pmyelo.mirror.aliyuncs.com","https://hub-mirror.c.163.com"],
  #无harbor可删除此行(这行编辑完文件删除)
  "insecure-registries": ["harbor地址"],
    
  "storage-driver": "overlay2",

  "live-restore": true,

  "log-driver": "json-file",
  "log-opts": {"max-size": "500m", "max-file": "3"}
}
-------------------------------
systemctl daemon-reload && systemctl enable docker && systemctl start docker
docker info
```

## 安装Kubernetes(所有节点)

```sh
# 配置k8s的yum源

cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

yum makecache
```

```sh
# 安装kubeadm、kubelet、kubectl
yum list kubeadm --showduplicates

yum install -y kubelet-1.23.0 kubeadm-1.23.0 kubectl-1.23.0 \ 
    --disableexcludes=kubernetes #禁掉除了kubernetes之外的别的仓库

systemctl enable --now kubelet
systemctl status kubelet #启动失败
```

## 部署Kubernetes的Master节点

```sh
# master节点上运行

kubeadm init \
  --apiserver-advertise-address=192.168.0.1 \
  --image-repository=registry.aliyuncs.com/google_containers \
  --kubernetes-version=v1.23.0 \
  --service-cidr=10.96.0.0/16 \
  --pod-network-cidr=10.244.0.0/16
 
  
#输出日志信息如下：
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.0.1:6443 --token z4ugzv.txit41bi3yd30egp \
	--discovery-token-ca-cert-hash sha256:225cf235c1448cc41edc84747d2f7c9157d378bed66cc9fd3822450385ab5253
```

```sh
# 192.168.0.1(master)节点运行

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=/etc/kubernetes/admin.conf

kubectl get nodes
```

```sh
# node节点

kubeadm join 192.168.0.1:6443 --token z4ugzv.txit41bi3yd30egp \
	--discovery-token-ca-cert-hash sha256:225cf235c1448cc41edc84747d2f7c9157d378bed66cc9fd3822450385ab5253

#master查看
kubectl get nodes
systemctl status kubelet #启动成功

# 如果忘记或者过期可以使用以下命令重新生成(master节点)
# kubeadm token create --print-join-command
```

```sh
# 部署网络插件(master节点运行)

# 注意：Kubernetes 和 Calico 的版本对应关系(https://docs.tigera.io/calico/latest/getting-started/kubernetes/requirements) 3.25支持1.23到1.26
# 其他版本地址：https://github.com/projectcalico/calico/blob/master/manifests/calico.yaml

wget https://projectcalico.docs.tigera.io/v3.25/manifests/calico.yaml

vi calico.yaml
# 与 kubeadm init的 --pod-network-cidr指定的一样
-------------------------------
- name: CALICO_IPV4POOL_CIDR
  value: "10.244.0.0/16"
-------------------------------
# 若docker镜像拉不下来，可以使用国内的仓库
sed -i "s#docker.io/calico/#m.daocloud.io/docker.io/calico/#g" calico.yaml 

kubectl apply -f calico.yaml
watch -n 1 kubectl get pod -A -o wide
# node STATUS 为 Ready，表示成功 
kubectl get nodes 
```

## 代码补全

```sh
yum install bash-completion -y

! grep -q kubectl "$HOME/.bashrc" && echo "source /usr/share/bash-completion/bash_completion" >>"$HOME/.bashrc"
! grep -q kubectl "$HOME/.bashrc" && echo "source <(kubectl completion bash)" >>"$HOME/.bashrc"
! grep -q kubeadm "$HOME/.bashrc" && echo "source <(kubeadm completion bash)" >>"$HOME/.bashrc"
! grep -q crictl "$HOME/.bashrc" && echo "source <(crictl completion bash)" >>"$HOME/.bashrc"
source "$HOME/.bashrc"
```

