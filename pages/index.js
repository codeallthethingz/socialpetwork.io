import cowsay from 'cowsay-browser';
import NavBar from '../components/NavBar';
import Layout from '../components/Layout';
const { parse } = require("url");

const Index = () => (
  <Layout>
    <pre>
      {cowsay.say({ text: 'mooooo' })}
    </pre>
  </Layout>
)

export default Index