import NavBar from './NavBar';
import Head from 'next/head'

const Layout = (props) => (
    <div>
    <Head>
        <link rel="stylesheet" href="https://bootswatch.com/4/sketchy/bootstrap.min.css" key="theme"/>
    </Head>
        <Head>
            <link rel="stylesheet" href="https://bootswatch.com/4/minty/bootstrap.min.css" key="theme"/>
        </Head>
        
        <NavBar/>
        { props.children }
    </div>
);

export default Layout;