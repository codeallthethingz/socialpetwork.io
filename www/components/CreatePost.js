import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import * as yup from 'yup'
import classNames from 'classnames'
import Thumb from './Thumb'
import axios from 'axios'
import FormData from 'form-data'

class CreatePost extends Component {
  onSubmit = async (values, { resetForm }) => {
    let formData = new FormData()

    formData.append('title', values.title)

    for (let i = 0; i < values.files.length; i++) {
      formData.append('file' + i, values.files[i])
    }

    await axios({
      method: 'post',
      url: '/api/post/index.js',
      data: formData,
      config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
    resetForm()
    this.props.onChange()
  }

  // example of validation with yup
  getSchema = () => {
    return yup.object().shape({
      files: yup.array(),
      title: yup.string().required()
    })
  }
  onDrop (values, setFieldValue, acceptedFiles) {
    setFieldValue('files', values.files.concat(acceptedFiles))
  }

  render () {
    return (
      <div id='createPost'>
        <Formik
          initialValues={{ files: [], title: '' }}
          validationSchema={this.getSchema}
          onSubmit={this.onSubmit}
          render={({ errors, setFieldValue, values }) => (
            <Form>
              Story
              <Field component='textarea' label='Title' name='title' />

              <Dropzone accept='image/*' onDrop={(acceptedFiles) => { this.onDrop(values, setFieldValue, acceptedFiles) }}>
                {({ getRootProps, getInputProps, isDragActive }) => {
                  var thumbs = values && values.files ? values.files.map((file, i) => (<Thumb key={i} file={file} />)) : []
                  return (
                    <div {...getRootProps()} className={classNames('dropzone', { 'dropzone--isActive': isDragActive })} >
                      <input {...getInputProps()} />
                      { values.files.length === 0 &&
                      <p>Drop photos here or click to add</p>
                      }
                      { thumbs }
                    </div>
                  )
                }}
              </Dropzone>
              {errors.files}
              <button type='Submit'>Post</button>
            </Form>
          )}
        />
      </div>
    )
  }
}
export default CreatePost
