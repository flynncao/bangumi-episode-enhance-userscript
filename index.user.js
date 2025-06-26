
// ==UserScript==
// @name        bangumi-copy-title
// @version     0.0.2
// @description Copy bangumi title to clipboard
// @author      Flynn Cao
// @updateURL   https://github.com/flynncao/bangumi-plugin-boilerplate/raw/main/index.user.js
// @downloadURL https://github.com/flynncao/bangumi-plugin-boilerplate/raw/main/index.user.js
// @namespace   https://flynncao.uk/
// @match       https://bangumi.tv/*
// @match       https://chii.in/*
// @match       https://bgm.tv/*
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)*/
// @license     MIT
// ==/UserScript==
'use strict';

function createButton(
  { id, text, icon, className, onClick, disabled = false },
  userSettings = {},
) {
  // Create button with base class
  const button = $('<strong></strong>').html(icon).addClass(className)[0];

  button.id = id;

  if (
    Object.prototype.hasOwnProperty.call(userSettings, 'showText') &&
    userSettings.showText === true
  ) {
    // add a text named "显示标题' following the svg icon with font size  21px 21px
    const textNode = document.createTextNode(text);
    const span = document.createElement('span');
    span.append(textNode);
    button.append(span);
  }

  button.addEventListener('click', onClick);
  button.disabled = disabled;

  return button
}

function createCheckbox(
  { id, label, className, onChange, checked, disabled = false },
  userSettings = {},
) {
  // Create the checkbox container
  const labelEl = document.createElement('label');
  labelEl.className = className;

  // Create the checkbox input
  const inputEl = document.createElement('input');
  inputEl.type = 'checkbox';
  inputEl.id = id;
  inputEl.checked = checked;

  // Create the custom checkmark span
  const checkmarkEl = document.createElement('span');
  checkmarkEl.className = 'bct-checkmark';

  // Create the label text span
  const textSpan = document.createElement('span');
  textSpan.textContent = label;

  // Append elements to the label
  labelEl.append(inputEl);
  labelEl.append(checkmarkEl);
  labelEl.append(textSpan);

  inputEl.addEventListener('change', onChange);
  inputEl.disabled = disabled;

  return labelEl
}

const BGM_SUBJECT_REGEX =
  /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/subject\/\d+/;

const STORAGE_NAMESPACE = 'BangumiCopyTitle';

var styles = "\n\n.bct-button {\n  /* --button-size: 2rem;\n  width: var(--button-size);\n  height: var(--button-size); */\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  color: #000;\n  transform: translateY(4px);\n  padding: 2px 5px;\n  border: 1px solid transparent;\n}\n\n[data-theme=\"dark\"] .bct-button {\n\tcolor: #f5f5f5;\n} \n\n.bct-button:hover {\n\tborder: 1px solid lightgray;\n\tborder-radius: 4px;\n\ttransition: all 0.2s ease-in-out;\n}\n\n.bct-button svg {\n  width: 100%;\n  height: 100%;\n  /* Let the button control the size */\n  flex: 1;\n}\n\n.bct-button svg {\n  max-width: 21px;\n  max-height: 21px;\n}\n\n\n.bct-button span{\n\tfont-size: 12px!important;\n\tfont-weight: normal!important;\n\tpadding-right: 4px!important;\n}\n[data-theme=\"dark\"] .bct-button svg {\n\tfilter:invert(1)\n}\n\n.bct-checkbox {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  height: 20px;\n  cursor: pointer;\n}\n\n.bct-checkbox .bct-checkmark {\n  /* You had no styles for this in the original, but leave this as a placeholder */\n\n}\n\n\n.bct-checkbox span:last-child {\n\tmargin-left: 2px;\n}\n";

// https://www.iconfont.cn/collections/detail?spm=a313x.user_detail.i1.dc64b3430.2d233a81lHbKxM&cid=7077
const Icons = {
  copy: '<svg t="1747748621659" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8232" data-darkreader-inline-fill="" width="256" height="256"><path d="M682.666667 341.333333h128v469.333334H341.333333v-128H213.333333V213.333333h469.333334v128z m0 85.333334v256h-256v42.666666h298.666666v-298.666666h-42.666666zM298.666667 298.666667v298.666666h298.666666V298.666667H298.666667z" fill="#444444" p-id="8233" data-darkreader-inline-fill="" style="--darkreader-inline-fill: var(--darkreader-background-444444, #33373a);"></path></svg>',
};

// eslint-disable-next-line unicorn/no-static-only-class
class Storage {
  static set(key, value) {
    localStorage.setItem(`${STORAGE_NAMESPACE}_${key}`, JSON.stringify(value));
  }

  static get(key) {
    const value = localStorage.getItem(`${STORAGE_NAMESPACE}_${key}`);
    return value ? JSON.parse(value) : undefined
  }

  static async init(settings) {
    const keys = Object.keys(settings);
    for (const key of keys) {
      const value = Storage.get(key);
      if (value === undefined) {
        Storage.set(key, settings[key]);
      }
    }
  }
}

(async function () {
  // Validate if the current page is a Bangumi subject page
  if (!BGM_SUBJECT_REGEX.test(location.href)) {
    return
  }

  // Storage
  Storage.init({
    copyJapaneseTitle: false,
    showText: true,
  });

  const userSettings = {
    copyJapaneseTitle: Storage.get('copyJapaneseTitle') || false,
    showText: Storage.get('showText') || true,
  };

  // Layout and Events
  const injectStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.append(styleEl);
  };
  injectStyles();

  $('h1.nameSingle').append(
    createButton(
      {
        id: 'bct-copy-title',
        text: '复制',
        icon: Icons.copy,
        className: 'bct-button',
        onClick: () => {
          const title = userSettings.copyJapaneseTitle
            ? $('h1.nameSingle').find('a').text().trim()
            : $('h1.nameSingle').find('a').attr('title');
          navigator.clipboard.writeText(title);
          // eslint-disable-next-line no-alert
          alert(`已复制${userSettings.copyJapaneseTitle ? '日文标题' : '标题'}到剪切板！`);
        },
      },
      userSettings,
    ),
  );

  $('h1.nameSingle').append(
    createCheckbox(
      {
        id: 'bct-hide-plain-comments',
        label: '日文名',
        className: 'bct-checkbox',
        onChange: (e) => {
          userSettings.copyJapaneseTitle = e.target.checked;
          Storage.set('copyJapaneseTitle', userSettings.copyJapaneseTitle);
        },
        checked: userSettings.copyJapaneseTitle,
        disabled: false,
      },
      userSettings,
    ),
  );
})();
