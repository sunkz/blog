---
title: "基于Github搭建Maven私服"
date: 2018-07-12T12:28:29-08:00
---

### Github Package 私服

> demo : http://github.com/sunkz/common

#### settings.xml

> 生效顺序 : .m2/settings.xml > $M2_HOME/conf/settings.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 https://maven.apache.org/xsd/settings-1.2.0.xsd">

    <activeProfiles>
        <!-- profile active 之后才会生效 -->
        <activeProfile>nexus</activeProfile>
    </activeProfiles>

    <servers>
        <!-- 私服秘钥 -->
        <server>
            <!-- 需要与 repository.id 一致 -->
            <id>github</id>
            <username>sunkz</username>
            <password>xxxx</password>
        </server>
    </servers>

    <mirrors>
        <!-- 远程仓库镜像, 拦截指定 repository -->
        <mirror>
            <id>aliyun</id>
            <!-- 拦截指定 repository.id, 此处为拦截 maven 中央仓库 -->
            <mirrorOf>central</mirrorOf>
            <url>http://maven.aliyun.com/nexus/content/repositories/central/</url>
        </mirror>
    </mirrors>

    <profiles>
        <profile>
            <id>nexus</id>
            <!-- 拉包顺序: '本地 .m2/repository' -> '远程 repositories' -->
            <!-- 多个 repositories 默认从上到下依次尝试拉取, 若不配置 repositories 默认拉 maven 中央仓库 -->
            <repositories>
                <!-- maven 中央仓库 -->
                <repository>
                    <id>central</id>
                    <url>https://repo1.maven.org/maven2</url>
                </repository>
                <!-- github 私服地址 -->
                <repository>
                    <id>github</id>
                    <url>https://maven.pkg.github.com/sunkz/common</url>
                    <snapshots>
                        <enabled>true</enabled>
                    </snapshots>
                </repository>
            </repositories>
        </profile>
    </profiles>

</settings>


```

#### pom.xml

```xml
<!-- mvn deploy 远程私服地址 -->
<distributionManagement>
    <repository>
        <!-- id 需要与 settings.xml server 中的 一致 -->
        <id>github</id>
        <url>https://maven.pkg.github.com/sunkz/common</url>
    </repository>
</distributionManagement>

```
