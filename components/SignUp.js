const SignUp = () => (
    <div>
        <center>
            <h2>I've been waiting for this all my life!</h2>
        </center>
  {/* Begin Mailchimp Signup Form */}
  <link href="//cdn-images.mailchimp.com/embedcode/classic-10_7.css" rel="stylesheet" type="text/css" />
  <style type="text/css" dangerouslySetInnerHTML={{__html: "\n        #mc_embed_signup{background:#fff; clear:left; font:14px Helvetica,Arial,sans-serif; }\n        /* Add your own Mailchimp form style overrides in your site stylesheet or in this style block.\n           We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */\n    " }} />
  <div id="mc_embed_signup">
    <form action="https://socialpetwork.us19.list-manage.com/subscribe/post?u=0765dea22b820d7e9684c73fd&id=b820d7a52d" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
      <div id="mc_embed_signup_scroll">
        <div className="mc-field-group">
          <label htmlFor="mce-EMAIL">Email Address </label>
          <input type="email" placeholder="your@email.com" name="EMAIL" className="required email" id="mce-EMAIL" />
        </div>
        <div id="mce-responses" className="clear">
          <div className="response" id="mce-error-response" style={{display: 'none'}} />
          <div className="response" id="mce-success-response" style={{display: 'none'}} />
        </div>    {/* real people should not fill this in and expect good things - do not remove this or risk form bot signups*/}
        <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true"><input type="text" name="b_0765dea22b820d7e9684c73fd_b820d7a52d" tabIndex={-1} defaultValue /></div>
        <div className="clear"><input type="submit" defaultValue="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button" /></div>
      </div>
    </form>
  </div>
  {/*End mc_embed_signup*/}
</div>

);

export default SignUp;