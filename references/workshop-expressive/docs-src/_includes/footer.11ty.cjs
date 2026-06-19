module.exports = function () {
  return `
<ws-footer>
  <div>
    <strong>Workshop Expressive Web Components</strong>
    <p>Foundation tokens, buttons, and drawer navigation primitives for the web.</p>
  </div>
  <a class="lit-link" href="https://lit.dev/" aria-label="Built with Lit">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="40" height="50" aria-hidden="true">
      <path fill="var(--lit-logo-dark-cyan, #00e8ff)" d="M40 120l20-60l90 90l-30 50l-40-40h-20"></path>
      <path fill="var(--lit-logo-dark-blue, #283198)" d="M80 160 L80 80 L120 40 L 120 120 M0 160 L40 200 L40 120 L20 120"></path>
      <path fill="var(--lit-logo-blue, #324fff)" d="M40 120v-80l40-40v80M120 200v-80l40-40v80M0 160v-80l40 40"></path>
      <path fill="var(--lit-logo-cyan, #0ff)" d="M40 200v-80l40 40"></path>
    </svg>
    <span>Built with Lit</span>
  </a>
</ws-footer>`;
};
