import React from 'react'
import { Field, Form, Formik } from 'formik'
import * as yup from 'yup'
import axios from 'axios'

class UserEdit extends React.Component {
  onSubmit = async (values, { resetForm }) => {
    if (values.username.trim() === '') {
      return
    }

    var dbUser = await axios({
      method: 'post',
      url: '/api/user',
      data: { username: values.username }
    })

    this.props.onChange(dbUser.data)
  }
  keyDown (e, values, resetForm) {
    if (e.metaKey && e.key === 'Enter') {
      this.onSubmit(values, { resetForm })
      e.preventDefault()
    }
  }
  getSchema = () => {
    return yup.object().shape({
      username: yup.string().required()
    })
  }
  render () {
    var props = this.props
    if (props.dbUser && !props.dbUser.username) {
      return (
        <div>
          You must choose a username
          <Formik
            initialValues={{ username: '' }}
            validationSchema={this.getSchema}
            onSubmit={this.onSubmit}
            render={({ setFieldValue, values, resetForm }) => (
              <Form >
            Username
                <Field component='input' name='username' onKeyDown={(e) => { this.keyDown(e, values, resetForm) }} />
                <button onKeyDown={(e) => { this.keyDown(e, values, resetForm) }} type='Submit'>Set forever</button>
              </Form>
            )}
          />
        </div>
      )
    }
    return null
  }
}
export default UserEdit
