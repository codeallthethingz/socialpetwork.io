import React, { Component } from 'react'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'

class CreatePost extends Component {
  constructor () {
    super()

    this.state = {

    }
  }

  render () {
    return (<Formik initialValues={{ title: '' }}
      onSubmit={async (values, { setSubmitting }) => {
        var res = await axios.post('/api/post/index.js', values)
        console.log(res)
        setSubmitting(false)
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string()
          .required('Required'),
        url: Yup.string()
          .required('Required')
      })}
    >
      {props => {
        const {
          touched,
          errors,
          isSubmitting,
          handleSubmit
        } = props
        return (
          <form onSubmit={handleSubmit}>
            <label htmlFor='title' style={{ display: 'block' }}>Title</label>
            <Field id='title' name='title' placeholder='Title' className={errors.title && touched.title ? 'text-input error' : 'text-input'} />
            {errors.title && touched.title && <div className='input-feedback'>{errors.title}</div>}

            <label htmlFor='url' style={{ display: 'block' }}>URL</label>
            <Field id='url' name='url' placeholder='URL' className={errors.title && touched.title ? 'text-input error' : 'text-input'} />
            {errors.url && touched.url && <div className='input-feedback'>{errors.url}</div>}

            <button type='submit' disabled={isSubmitting || Object.keys(errors).length > 0}>
              Submit
            </button>
            <DisplayFormikState {...props} />
          </form>
        )
      }}
    </Formik>)
  }
}
export default CreatePost

export const DisplayFormikState = props =>
  <div style={{ margin: '1rem 0' }}>
    <h3 style={{ fontFamily: 'monospace' }} />
    <pre
      style={{
        background: '#f6f8fa',
        fontSize: '.65rem',
        padding: '.5rem'
      }}
    >
      <strong>props</strong> ={' '}
      {JSON.stringify(props, null, 2)}
    </pre>
  </div>
