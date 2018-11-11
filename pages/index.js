import SignUp from '../components/SignUp';
import Layout from '../components/Layout';
const { parse } = require("url");

const Index = () => (
  <Layout>
    <img src="/static/img/dog-splash.jpg" height="200"/>
    <SignUp/>
  </Layout>
)

export default Index