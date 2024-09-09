/**
 * ----------------------------------------
 * (Forgejo ui customization)
 * ----------------------------------------
 * convert diagram codes in markdown doc to images with Kroki
 * ----------------------------------------
 */

// Front-end
const fe = {
    // Kroki server
    server: 'https://kroki.io',
    // Output format
    format: 'svg',
    // Kroki supports below diagrams.
    diagrams: [
        'actdiag',
        'blockdiag',
        'bytefield',
        'c4plantuml',
        'd2',
        'ditaa',
        'erd',
        'graphviz',
        'dot',
        'nomnoml',
        'nwdiag',
        'packetdiag',
        'pikchr',
        'plantuml',
        'rackdiag',
        'seqdiag',
        'structurizr',
        'svgbob',
        'symbolator',
        'umlet',
        'vega',
        'vegalite',
        'wavedrom',
        'wireviz',
        // optional diagram
        'bpmn',
        'excalidraw',
        // Mermaid is rendered by forgejo.
        // 'mermaid',
        'diagramsnet',
    ],
    // add diagram image to markdown.
    addDiagramImage: async function (element) {

        const diagImage = await this._diagImage(element);
        if (!diagImage) { return }

        // pre>code
        const pre = element.parentElement;

        // p
        const p = document.createElement('p');
        p.classList.add('dac-rewrite-diag-block')

        // p>img
        const img = document.createElement('img');
        img.src = `data:image/svg+xml,${encodeURIComponent(diagImage)}`;

        // pre>code>button
        const btnOnCode = document.createElement('button');
        btnOnCode.value = 'diag-show';
        btnOnCode.classList.add(
            'dac-rewrite-diag-show',
            'ui',
            'button'
        );

        // p>img>button
        const btnOnDiag = document.createElement('button');
        btnOnDiag.value = 'code-show';
        btnOnDiag.classList.add(
            'dac-rewrite-code-show',
            'ui',
            'button'
        );

        //
        const handler = function (event) {
            switch (event.currentTarget.value) {
                case 'code-show':
                    pre.style.display = 'block';
                    p.style.display = 'none';
                    break;
                case 'diag-show':
                    pre.style.display = 'none';
                    p.style.display = 'block';
                    break;
            }
        }

        btnOnCode.addEventListener('click', handler);
        btnOnDiag.addEventListener('click', handler);

        //
        pre.append(btnOnCode);
        pre.after(p);
        p.append(img);
        p.append(btnOnDiag);

        //
        pre.style.display = 'none';
    },
    // read diagram code from 'code' element.
    _code: function (element) {
        return decodeURIComponent(encodeURIComponent(element.textContent));
    },
    // convert diagram code to compressed binary of Base64 format.
    _zippedB64: function (element) {
        const code = this._code(element);
        const zip = pako.deflate(new TextEncoder().encode(code), { level: 9, to: 'string' });
        // if use imaya/zlib.js
        // const zip = new Zlib.Deflate(new TextEncoder().encode(code)).compress();
        return btoa([...zip].map(n => String.fromCharCode(n)).join(''))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    },
    // read diagram type from 'code' element.
    _diagType: function (element) {
        const diag = element.classList[1].replace('language-', '').toLowerCase();
        if (this.diagrams.includes(diag)) return diag;
    },
    // get diagram image from Kroki server.
    _diagImage: async function (element) {
        const diagType = this._diagType(element);
        if (!diagType) { return }

        const res = await fetch(
            `${this.server}/${diagType}/${this.format}/${this._zippedB64(element)}`,
            { mode: 'cors' }
        );
        if (!res.ok) { return }

        return await res.text();
    }
}

// ----------------------------------------
// add diagram.
function run() {
    document.querySelectorAll('pre.code-block>code[class*="language-"]').forEach(element => {
        fe.addDiagramImage(element);
    });
}

run();

// EOF
