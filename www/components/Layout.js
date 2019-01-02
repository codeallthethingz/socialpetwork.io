import NavBar from './NavBar'
import Head from 'next/head'

const Layout = (props) => (
  <div>
    <Head>
      <link rel='shortcut icon' type='image/png' href='/static/img/favicon.ico' />
      <link rel='stylesheet' href='https://bootswatch.com/4/minty/bootstrap.css' key='theme' />
      <link rel='stylesheet' href='/static/css/main.css' key='overrides' />
    </Head>
    <NavBar />
    <div className='container'>
      {props.children}
    </div>
  </div>
)

export default Layout
