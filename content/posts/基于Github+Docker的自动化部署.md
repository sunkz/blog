---
title: "基于Github+Docker的自动化部署"
date: 2019-01-21T18:43:29-08:00
---


## 准备工作

- Github
- Dockerhub
- Server (没有服务器的话,本机使用内网穿透也可以)

## 整体流程

![](https://image-pub.guazistatic.com/qnbdp1687261666519eb77b74c447a0836c018cf26c61be1066.jpeg)

## 具体步骤 

### code

创建springboot工程提供一个接口, 并编写 dockerfile

```java
/**
 * hello 接口
 */
 @GetMapping("/hello")
 public String hello(){
     return "hello";
 }
```

```dockerfile
FROM openjdk:11

WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN ./mvnw package -DskipTests

ENTRYPOINT ["java","-jar","target/hello-0.0.1-SNAPSHOT.jar"]
```

### Github

创建hello repository

![](https://image-pub.guazistatic.com/qnbdp16872617386e0861eaba004d73a34dcbfc302d51281066.jpeg)

### Dockerhub

创建hello repository并关联上Github的hello repository

<img src="https://image-pub.guazistatic.com/qnbdp1687312654cb1a06a6825940d5b8879914cee452f81066.jpeg" alt="" style="zoom:50%;" />

### hook

编写hook服务,当 dockerhub hello image 更新时,会触发该hook

``` java
/**
 * hook在server上运行,当Dockerhub中hello image有变动,
 * 将触发该接口,该接口将会执行auto_deploy脚本
 */
@GetMapping("/hook")
public void hook(){
    Runtime.getRuntime().exec("/root/code/auto_deploy.sh");
}
```

```sh
#! /bin/bash

# 销毁旧的容器,从dockerhub拉取最新hello images并启动

docker stop hello
docker rm hello
docker pull sunkezheng/hello
docker run --name hello -p8080:8080 -d sunkezheng/hello
```

在server上启动该hook服务

![](https://image-pub.guazistatic.com/qnbdp16872617581339524958b54597ad2485e2b8368fb01066.jpeg)

### webhook

dockerhub hello repository添加webhook指向 server中的hook服务

<img src="https://image-pub.guazistatic.com/qnbdp16872619515ddc2bf483e64eaab0aca9a8008650ca1066.jpeg" style="zoom:67%;" />

## 触发流水线

至此整条流水线已经建立

![](https://image-pub.guazistatic.com/qnbdp1687261666519eb77b74c447a0836c018cf26c61be1066.jpeg)

将hello springboot工程提交到Github hello repository, 触发整条流水线.

![](https://image-pub.guazistatic.com/qnbdp1687261879ca80a39a1c34400c98305aebb08216e21066.jpeg)

curl 请求测试

<img src="https://image-pub.guazistatic.com/qnbdp1687261913454650b157fb47e89ff11b877dd312af1066.jpeg" style="zoom: 33%;" />

## 扩展

- Github Actions将支持CI/CD到自定的Server
- 使用Jenkins可以简化Hook部分
- 配合Nginx使用可实现 '零停机' 更新
- 第三方云厂商提供了大量模板式Serverless的DevOps解决方案

```shell
#! /bin/bash

# 基于Jar包的hook

lsof -i:8080 | grep java | awk '{print $2}' | xargs kill -9
rm -rf http/
git clone git@github.com:sunkz/http.git
cd http
mvn clean package -DskipTests
java -jar ./target/http-0.0.1-SNAPSHOT.jar
```

