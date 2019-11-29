<template>
  <div class="user-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="50">
        <el-col :span="8">
          <el-input
            clearable
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            @change="getUserList"
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogFormVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <template>
        <el-table class="user-table" :data="users" style="width: 100%" border stripe>
          <!-- 索引列 type=“index” -->
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="username" label="姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <template v-slot="slotProps">
              <el-switch v-model="slotProps.row.mg_state" @change="userStateChanged(slotProps.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200px">
            <template v-slot="slotProps">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="showEditForm(slotProps.row.id)"
              ></el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="open(slotProps.row.id)"
              ></el-button>
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button
                  size="mini"
                  type="warning"
                  icon="el-icon-setting"
                  @click="showAddRoleDialog(slotProps.row)"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-pagination
        class="user-center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[2, 3, 4, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisible">
      <el-form ref="addFormRef" :rules="addFormRules" label-width="70px" :model="addFormInfo">
        <el-form-item label="用户名" prop="username">
          <el-input autocomplete="off" v-model="addFormInfo.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" autocomplete="off" v-model="addFormInfo.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" autocomplete="off" v-model="addFormInfo.checkPass"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input autocomplete="off" v-model="addFormInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input autocomplete="off" v-model="addFormInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible">
      <el-form ref="editDialogRef" :rules="editFormRules" label-width="70px" :model="editFormInfo">
        <el-form-item label="用户名" prop="username">
          <el-input autocomplete="off" v-model="editFormInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input autocomplete="off" v-model="editFormInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input autocomplete="off" v-model="editFormInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="addRoleVisible">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
      </div>
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible=false">取 消</el-button>
        <el-button type="primary" @click="saveRoleEdit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 密码验证
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.addFormInfo.checkPass !== '') {
          this.$refs.addFormRef.validateField('checkPass')
        }
        callback()
      }
    }
    // 密码确认
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addFormInfo.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    // 邮箱验证
    const validateEmail = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('邮箱不能为空'))
      } else if (!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value)) {
        callback(new Error('请输入正确邮箱地址'))
      } else {
        callback()
      }
    }
    const validateMobile = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('手机号不能为空'))
      } else if (
        !/^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/.test(
          value
        )
      ) {
        callback(new Error('请输入正确手机号'))
      } else {
        callback()
      }
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      users: [],
      total: 0,
      // 编辑用户flag
      editDialogVisible: false,
      editFormInfo: {
        username: '',
        email: '',
        mobile: ''
      },
      editFormRules: {
        email: [{ validator: validateEmail, trigger: 'blur' }],
        mobile: [{ validator: validateMobile, trigger: 'blur' }]
      },
      // 添加用户flag
      dialogFormVisible: false,
      addFormInfo: {
        username: '',
        password: '',
        email: '',
        mobile: '',
        checkPass: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [{ validator: validatePass, trigger: 'blur' }],
        checkPass: [{ validator: validatePass2, trigger: 'blur' }],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        mobile: [{ validator: validateMobile, trigger: 'blur' }]
      },
      // 分配角色flag
      addRoleVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.users = data.data.users
      this.total = data.data.total
    },
    // 页数变化处理函数
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    async userStateChanged(userinfo) {
      const { data } = await this.$http.put(
        `/users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      console.log(data)
      if (data.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态修改失败')
      }
      this.$message.success('更新成功')
    },
    async addUser() {
      // 表单验证的结果, 只有结果为true时，表明表单验证成功，防止表单验证没通过却提交了请求
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return this.$message.error('请正确填写表单')
      })
      const { data } = await this.$http.post('/users', this.addFormInfo)
      if (data.meta.status !== 201) {
        return this.$message.error(data.meta.msg)
      }
      this.$message.success(data.meta.msg)
      this.$refs.addFormRef.resetFields()
      this.getUserList()
    },
    async showEditForm(id) {
      this.editDialogVisible = true
      const { data } = await this.$http.get(`/users/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.editFormInfo = data.data
    },
    // 提交编辑用户表单
    async editUser() {
      this.$refs.editDialogRef.validate(valid => {
        if (!valid) return this.$message.error('表单填写有误')
      })
      const { data } = await this.$http.put(
        `/users/${this.editFormInfo.id}`,
        this.editFormInfo
      )
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.editDialogVisible = false
      this.getUserList()
      this.$message.success(data.meta.msg)
    },
    // 打开删除对话框
    async open(id) {
      const res = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (res === 'confirm') {
        const { data } = await this.$http.delete(`/users/${id}`)
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg)
        }
        this.getUserList()
        this.$message.success(data.meta.msg)
      }
    },
    // 分配角色对话框
    async showAddRoleDialog(row) {
      this.userInfo = row
      console.log(row)
      const { data } = await this.$http.get('/roles')
      if (data.meta.status !== 200) {
        return thsi.$message.error(data.meta.msg)
      }
      this.rolesList = data.data
      this.addRoleVisible = true
    },
    async saveRoleEdit() {
      if (this.selectedRoleId === '') {
        return this.$message.error('请选择角色')
      }
      const { data } = await this.$http.put(`/users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.getUserList()
      this.addRoleVisible = false
      this.$message.success(data.meta.msg)
    }
  },
  watch: {
    dialogFormVisible: function(newValue) {
      !newValue && this.$refs.addFormRef.resetFields()
    },
    editDialogVisible: function(newValue) {
      !newValue && this.$refs.editDialogRef.resetFields()
    },
    addRoleVisible: function(newValue) {
      !newValue&&(this.selectedRoleId='')
    }
  }
}
</script>
<style lang='less' scoped>
.user-container {
  .box-card {
    margin-top: 20px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
    .user-table {
      margin-top: 20px;
      font-size: 12px;
    }
    .user-center {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
