<template>
  <div class="rights-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <template>
        <el-table :data="rightsList" stripe border style="width: 100%">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="authName" label="权限名称"></el-table-column>
          <el-table-column prop="path" label="路径"></el-table-column>
          <el-table-column prop="level" label="权限等级">
            <template v-slot="slotProps">
              <el-tag type="success" v-if="slotProps.row.level==0">一级</el-tag>
              <el-tag type="warning" v-else-if="slotProps.row.level==1">二级</el-tag>
              <el-tag type="danger" v-else>三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data } = await this.$http.get('/rights/list')
      console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.rightsList = data.data
    }
  }
}
</script>
<style lang='less' scoped>
.rights-container {
  .box-card {
    margin-top: 20px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    .el-table {
      font-size: 12px !important;
    }
  }
}
</style>
