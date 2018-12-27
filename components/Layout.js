import NavBar from './NavBar'
import Head from 'next/head'

const Layout = (props) => (
  <div>
    <Head>
      <link rel='stylesheet' href='https://bootswatch.com/4/sketchy/bootstrap.min.css' key='theme' />
    </Head>
    <NavBar />
    <div className='container'>
      {props.children}
    </div>
  </div>
)

export default Layout
