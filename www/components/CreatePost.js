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
    if (values.text.trim() === '') {
      return
    }
    this.props.onLoading()
    let formData = new FormData()

    formData.append('text', values.text)

    for (let i = 0; i < values.files.length; i++) {
      formData.append('file' + i, values.files[i])
    }

    await axios({
      method: 'post',
      url: '/api/post',
      data: formData,
      config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
    resetForm()
    this.props.onChange()
  }

  getSchema = () => {
    return yup.object().shape({
      files: yup.array(),
      text: yup.string().required()
    })
  }
  onDrop (values, setFieldValue, acceptedFiles) {
    var filteredFiles = acceptedFiles.filter((acceptedFile) => {
      var found = false
      values.files.forEach(element => {
        if (element.name === acceptedFile.name) {
          found = true
        }
      })
      return !found
    })
    setFieldValue('files', values.files.concat(filteredFiles))
  }
  onClick (e, file, values, setFieldValue) {
    values.files.splice(values.files.indexOf(file), 1)
    setFieldValue('files', values.files)
    e.preventDefault()
  }

  keyDown (e, values, resetForm) {
    if (e.metaKey && e.key === 'Enter') {
      this.onSubmit(values, { resetForm })
      e.preventDefault()
    }
  }

  render () {
    return (
      <div id='createPost'>
        <Formik
          initialValues={{ files: [], text: '' }}
          validationSchema={this.getSchema}
          onSubmit={this.onSubmit}
          render={({ setFieldValue, values, resetForm }) => (
            <Form >
            Story
              <Field component='textarea' name='text' onKeyDown={(e) => { this.keyDown(e, values, resetForm) }} />
              <Dropzone onKeyDown={(e) => { this.keyDown(e, values, resetForm) }} accept='image/*' onDrop={(acceptedFiles) => { this.onDrop(values, setFieldValue, acceptedFiles) }}>
                {({ getRootProps, getInputProps, isDragActive }) => {
                  var thumbs = values && values.files ? values.files.map((file, i) =>
                    (<Thumb onClick={(e) => { this.onClick(e, file, values, setFieldValue) }} key={file.name} file={file} />)) : []
                  return (
                    <div {...getRootProps()} className={classNames('dropzone', { 'dropzone--isActive': isDragActive })} >
                      <input {...getInputProps()} />
                      {values.files.length === 0 &&
                      <p>Drop photos here or click to add</p>
                      }
                      {thumbs}
                    </div>
                  )
                }}
              </Dropzone>
              <button onKeyDown={(e) => { this.keyDown(e, values, resetForm) }} type='Submit'>Post</button>
            </Form>
          )}
        />
      </div>
    )
  }
}
export default CreatePost
