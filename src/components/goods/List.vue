<template>
  <div class="list-contianer">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="50">
        <el-col :span="8">
          <el-input
            clearable
            placeholder="请输入内容"
            class="input-with-select"
            v-model="goodsInfo.query"
            @keyup.enter.native="getGoodsList"
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="90"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90"></el-table-column>
        <el-table-column label="创建时间" width="140">
          <template v-slot="slotProps">{{slotProps.row.add_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template v-slot="slotProps">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeById(slotProps.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mar-center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="goodsInfo.pagenum"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="goodsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      goodsInfo: {
        query: '',
        // 默认页数
        pagenum: 1,
        // 默认一页展示多少条
        pagesize: 10
      },
      // 存放商品信息
      goodsList: [],
      // 商品总数量
      total: 0
    }
  },
  methods: {
    async getGoodsList() {
      const { data } = await this.$http.get('/goods', {
        params: this.goodsInfo
      })
      console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.goodsList = data.data.goods
      this.total = data.data.total
    },
    handleSizeChange(val) {
      this.goodsInfo.pagesize = val
      this.getGoodsList()
    },
    handleCurrentChange(val) {
      this.goodsInfo.pagenuk = val
      this.getGoodsList()
    },
    // 通过id删除商品
    async removeById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该商品,是否继续',
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).catch(err => err)
      if (result !== 'confirm') {
        return
      }
      const { data } = await this.$http.delete(`/goods/${id}`)
      this.$showMessage(data, 200, true)
      this.getGoodsList()
    },
    goAddPage() {
      this.$router.push('/goods/add')
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>
<style lang='less' scoped>
</style>
