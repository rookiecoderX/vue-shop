<template>
  <el-container class="home-container">
    <el-header class="header">
      <div class="header-left">
        <div class="avator">
          <img src="../assets/logo.png" />
        </div>
        <h1>电商平台管理系统</h1>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'" class="aside">
        <div class="toggle" @click="isCollapse=!isCollapse">|||</div>
        <el-menu
          unique-opened
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="currentActive"
        >
          <el-submenu :index="`${index+1}`" v-for="(item, index) in menuinfo" :key="item.id">
            <template slot="title">
              <i :class="`iconfont ${icon[index]}`"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item-group v-for="secItem in item.children" :key="secItem.id">
              <el-menu-item :index="'/'+secItem.path" @click="serNavActive('/'+secItem.path)">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{secItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuinfo: '',
      icon: [
        'icon-user',
        'icon-tijikongjian',
        'icon-shangpin',
        'icon-danju',
        'icon-baobiao'
      ],
      isCollapse: false,
      // 当前高亮菜单项
      currentActive: ''
    }
  },
  created() {
    this.getMenuList()
    this.currentActive = window.sessionStorage.getItem('active')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data } = await this.$http.get('/menus')
      if (data.meta.status !== 200) return this.$message.error(data.meta.msg)
      this.menuinfo = data.data
    },
    serNavActive(path) {
      this.currentActive = path
      window.sessionStorage.setItem('active', path)
    }
  },
  components: {
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #373d41;
    .header-left {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      .avator {
        width: 45px;
        height: 45px;
        margin-right: 10px;
        background-color: #fff;
        border: 2px solid #ccc;
        border-radius: 50%;
        padding: 5px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
    }
  }
  .main {
    background-color: #eaedf1;
  }
  .aside {
    background-color: #333744;
    transition: width .5s;
    .toggle {
      background-color: rgb(51, 50, 50);
      color: #bbb;
      height: 30px;
      text-align: center;
      line-height: 30px;
    }
    .el-menu {
      border: none;
      .iconfont {
        margin-right: 10px;
      }
    }
  }
}
</style>
