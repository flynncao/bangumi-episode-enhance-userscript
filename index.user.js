
// ==UserScript==
// @name        bangumi-comment-enhance
// @version     0.2.15
// @description Improve comment reading experience, hide certain comments, sort featured comments by reaction count or reply count, and more.
// @author      Flynn Cao
// @updateURL   https://flynncao.github.io/bangumi-episode-enhance-userscript/index.user.js
// @downloadURL https://flynncao.github.io/bangumi-episode-enhance-userscript/index.user.js
// @namespace   https://flynncao.uk/
// @match       https://bangumi.tv/*
// @match       https://chii.in/*
// @match       https://bgm.tv/*
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)*/
// @license     MIT
// ==/UserScript==
'use strict';

class CustomCheckboxContainer {
    id;
    label;
    checked;
    input;
    element;
    constructor(id, label, checked) {
        this.id = id;
        this.label = label;
        this.checked = checked;
        this.input = null;
        this.element = null;
    }
    createElement() {
        if (this.element) {
            return this.input;
        }
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = this.id;
        checkbox.checked = this.checked;
        this.input = checkbox;
        return checkbox;
    }
    createLabel() {
        const label = document.createElement('label');
        label.htmlFor = this.id;
        label.textContent = this.label;
        return label;
    }
    getContainer() {
        const container = document.createElement('div');
        container.className = 'checkbox-container';
        container.append(this.createElement());
        container.append(this.createLabel());
        return container;
    }
    getInput() {
        return this.input;
    }
}

const Icons = {
    eyeOpen: '<svg t="1747629142037" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1338"  ><path d="M947.6 477.1c-131.1-163.4-276.3-245-435.6-245s-304.5 81.7-435.6 245c-16.4 20.5-16.4 49.7 0 70.1 131.1 163.4 276.3 245 435.6 245s304.5-81.7 435.6-245c16.4-20.4 16.4-49.6 0-70.1zM512 720c-130.6 0-251.1-67.8-363.5-207.8 112.4-140 232.9-207.8 363.5-207.8s251.1 67.8 363.5 207.8C763.1 652.2 642.6 720 512 720z" fill="#333333" p-id="1339"></path><path d="M512 592c44.1 0 79.8-35.7 79.8-79.8 0-44.1-35.7-79.8-79.8-79.8-44.1 0-79.8 35.7-79.8 79.8-0.1 44.1 35.7 79.8 79.8 79.8z m0 72c-83.8 0-151.8-68-151.8-151.8 0-83.8 68-151.8 151.8-151.8 83.8 0 151.8 68 151.8 151.8 0 83.8-68 151.8-151.8 151.8z m0 0" fill="#333333" p-id="1340"></path></svg>',
    newest: '<svg t="1747628315444" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1861"  ><path d="M512.736 992a483.648 483.648 0 0 1-164.672-28.8 36.88 36.88 0 1 1 25.104-69.36 407.456 407.456 0 1 0-184.608-136.512A36.912 36.912 0 0 1 129.488 801.6a473.424 473.424 0 0 1-97.472-290A480 480 0 1 1 512.736 992z" fill="#5F5F5F" p-id="1862"></path><path d="M685.6 638.592a32 32 0 0 1-14.032-2.96l-178.048-73.888a36.8 36.8 0 0 1-22.912-34.016V236.672a36.944 36.944 0 1 1 73.888 0v266.72l155.2 64.272a36.336 36.336 0 0 1 19.952 48 37.616 37.616 0 0 1-34.048 22.928z" fill="#5F5F5F" p-id="1863"></path></svg>',
    answerSheet: '<svg t="1741855047626" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2040"  ><path d="M188.8 135.7c-29.7 0-53.8 24.1-53.8 53.7v644.7c0 29.7 24.1 53.7 53.8 53.7h645.4c29.7 0 53.8-24.1 53.8-53.7V189.4c0-29.7-24.1-53.7-53.8-53.7H188.8z m-13-71.1h671.5c61.8 0 111.9 50.1 111.9 111.8v670.8c0 61.7-50.1 111.8-111.9 111.8H175.8C114 959 63.9 909 63.9 847.2V176.4c0-61.8 50.1-111.8 111.9-111.8z m0 0" fill="#333333" p-id="2041"></path><path d="M328 328h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM556 332h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM784 332h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#333333" p-id="2042"></path><path d="M328 546h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM556 550h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM784 550h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#333333" p-id="2043"></path><path d="M328 764h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM556 768h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM784 768h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#333333" p-id="2044"></path></svg>',
    sorting: '<svg t="1741855109866" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2338"  ><path d="M375 898c-19.8 0-36-16.2-36-36V162c0-19.8 16.2-36 36-36s36 16.2 36 36v700c0 19.8-16.2 36-36 36z" fill="#333333" p-id="2339"></path><path d="M398.2 889.6c-15.2 12.7-38 10.7-50.7-4.4L136.6 633.9c-12.7-15.2-10.7-38 4.4-50.7 15.2-12.7 38-10.7 50.7 4.4l210.8 251.3c12.8 15.2 10.8 38-4.3 50.7zM649 126c19.8 0 36 16.2 36 36v700c0 19.8-16.2 36-36 36s-36-16.2-36-36V162c0-19.8 16.2-36 36-36z" fill="#333333" p-id="2340"></path><path d="M625.8 134.4c15.2-12.7 38-10.7 50.7 4.4l210.8 251.3c12.7 15.2 10.7 38-4.4 50.7-15.2 12.7-38 10.7-50.7-4.4L621.4 185.1c-12.7-15.2-10.7-38 4.4-50.7z" fill="#333333" p-id="2341"></path></svg>',
    font: '<svg t="1741855156691" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2635"  ><path d="M859 201H165c-19.8 0-36-16.2-36-36s16.2-36 36-36h694c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#585757" p-id="2636"></path><path d="M476 859V165c0-19.8 16.2-36 36-36s36 16.2 36 36v694c0 19.8-16.2 36-36 36s-36-16.2-36-36z" fill="#585757" p-id="2637"></path></svg>',
    gear: '<svg t="1741861365461" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2783" data-darkreader-inline-fill=""  ><path d="M594.9 64.8c36.8-0.4 66.9 29.1 67.3 65.9v7.8c0 38.2 31.5 69.4 70.2 69.4 12.3 0 24.5-3.3 35-9.3l7.1-4.1c10.3-5.9 22.1-9 33.9-9 23.9 0 46.2 12.5 58.3 32.8L949.9 359c18.7 31.6 7.6 71.9-24.6 90.1l-6.9 3.9c-34 19.2-45.7 61.2-26.4 93.8 6.1 10.3 14.9 18.9 25.4 24.8l7 3.9c32.3 18 43.6 58.5 24.8 90.2L866 806.3c-9.1 15.2-23.8 26.2-41 30.6-17.1 4.4-35.3 2.2-50.7-6.4l-7-3.9c-21.9-12.2-48.5-12.4-70.6-0.4-10.7 5.9-19.7 14.5-25.9 25-6.1 10.4-9.4 22.1-9.3 33.8v7.8c0.1 17.8-7.2 34.7-20 47.1-12.6 12.2-29.6 19-47.2 19H428c-36.6 0.3-66.7-29-67.2-65.5l-0.1-7.8c-0.1-18.4-7.6-36-20.8-48.8-22.5-22-56.9-26.5-84.3-10.9l-7 4.1c-10.3 5.8-22 8.9-33.8 8.9-23.9 0-46.1-12.4-58.2-32.8L73.2 665.2c-8.9-15.1-11.3-33.2-6.7-50.1 4.6-16.9 15.8-31.3 31.2-39.8l6.8-3.9c16.2-9 28.2-24.2 33.1-42.1 4.9-17.4 2.4-36.1-6.9-51.6-6.2-10.4-15.1-19-25.7-24.9l-6.9-3.9c-15.5-8.4-27-22.8-31.7-39.8-4.7-17-2.3-35.2 6.7-50.4L156.3 218c9-15.1 23.8-26.2 41-30.6 17.1-4.4 35.3-2.1 50.7 6.5l7.1 3.9c21.9 12.3 48.6 12.5 70.7 0.5 10.8-5.9 19.8-14.6 26-25.1 6.1-10.4 9.3-22.2 9.2-34.1v-7.9c-0.2-17.8 7-34.8 19.8-47.2 12.6-12.3 29.7-19.1 47.5-19.1h166.6z m-163.2 71c-3.1 0-6.1 1.2-8.4 3.3-1.9 1.8-2.9 4.2-2.9 6.8l0.1 7.6c0.2 21.2-5.4 42-16.3 60.3a120.02 120.02 0 0 1-45.2 43.7c-37.4 20.4-82.6 20.2-119.7-0.7l-6.8-3.8c-2.8-1.6-6.1-2-9.2-1.2-2.8 0.7-5.3 2.5-6.8 5l-80 135.1c-2.7 4.5-1.1 10.2 4.1 13l6.7 3.7c18.6 10.3 34 25.3 44.7 43.4 16.3 27.6 20.6 59.9 12.1 90.8-8.5 30.8-29 56.9-56.9 72.5l-6.6 3.7c-5 2.9-6.6 8.5-3.9 12.9l80 135.1c1.9 3.2 5.7 5.3 10 5.3 2.1 0 4.3-0.5 6.1-1.6l6.8-3.8c18.1-10.3 38.8-15.8 59.9-15.8 31.8 0 62 12.3 84.7 34.4 23 22.5 35.9 52.6 36 84.7v7.5c0 5.2 4.9 9.9 11.3 9.9h160c3.2 0 6.2-1.2 8.3-3.3 1.8-1.7 2.9-4.2 2.9-6.7v-7.5c-0.1-20.9 5.6-41.6 16.4-59.8 10.8-18.3 26.4-33.4 45.1-43.7 37.3-20.4 82.4-20.2 119.5 0.6l6.7 3.8c2.8 1.5 6.1 1.9 9.2 1.1 2.8-0.7 5.3-2.5 6.8-5l80-135c2.7-4.5 1.1-10.2-4-13l-6.7-3.7c-18.4-10.2-33.7-25.2-44.4-43.3-33.8-57.1-13.4-130.5 45-163.5l6.6-3.7c5.1-2.9 6.6-8.5 3.9-13l-79.9-135.1c-2.2-3.4-6-5.4-10-5.3-2.1 0-4.3 0.5-6.1 1.6l-6.8 3.8c-18.3 10.5-39.1 16-60.2 16-66.5 0.2-120.6-53.5-120.8-119.9v-7.5c0-5.3-4.8-10-11.3-10l-160 0.3z m-3.4-15.5" p-id="2784"></path><path d="M512 584c39.8 0 72-32.2 72-72s-32.2-72-72-72-72 32.2-72 72 32.2 72 72 72z m0 72c-79.5 0-144-64.5-144-144s64.5-144 144-144 144 64.5 144 144-64.5 144-144 144z m0 0" p-id="2785"></path></svg>',
};

var Environment;
(function (Environment) {
    Environment["STANDALONE"] = "standalone";
    Environment["CLOUD_STORAGE"] = "cloud_storage";
})(Environment || (Environment = {}));
function isCloudStorageEnvironment() {
    return typeof chiiApp !== 'undefined' && chiiApp.cloud_settings !== undefined;
}
function hasChiiLib() {
    return typeof chiiLib !== 'undefined' && chiiLib.ukagaka !== undefined;
}

const NAMESPACE = 'BangumiCommentEnhance';
class Storage {
    static useCloudStorage = isCloudStorageEnvironment();
    static isCloudAvailable() {
        try {
            return this.useCloudStorage && typeof chiiApp !== 'undefined' && chiiApp.cloud_settings !== undefined;
        }
        catch {
            return false;
        }
    }
    static get(key) {
        console.log('[BCE] Storage.get called for key:', key);
        console.log(this.useCloudStorage, this.isCloudAvailable());
        try {
            if (this.isCloudAvailable()) {
                const value = chiiApp.cloud_settings.get(key);
                return value !== undefined ? value : undefined;
            }
        }
        catch (e) {
            console.warn(`[BCE] Failed to get cloud config '${key}', falling back to localStorage:`, e);
        }
        const value = localStorage.getItem(`${NAMESPACE}_${key}`);
        return value ? JSON.parse(value) : undefined;
    }
    static set(key, value) {
        console.log('[BCE] Storage.set called for key:', key);
        console.log(this.useCloudStorage, this.isCloudAvailable());
        try {
            localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value));
            if (this.isCloudAvailable()) {
                chiiApp.cloud_settings.update({ [key]: value });
            }
        }
        catch (e) {
            console.warn(`[BCE] Failed to update cloud config '${key}'`, e);
        }
    }
    static async init(settings) {
        const keys = Object.keys(settings);
        for (const key of keys) {
            const value = Storage.get(key);
            if (value === undefined) {
                Storage.set(key, settings[key]);
            }
        }
        if (this.isCloudAvailable()) {
            try {
                const allCloudSettings = chiiApp.cloud_settings.getAll();
                for (const [key, value] of Object.entries(allCloudSettings)) {
                    if (key in settings && !localStorage.getItem(`${NAMESPACE}_${key}`)) {
                        localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value));
                    }
                }
            }
            catch (e) {
                console.warn('[BCE] Failed to sync cloud settings:', e);
            }
        }
    }
    static hasChiiLib() {
        return hasChiiLib();
    }
    static isCloudEnvironment() {
        return this.useCloudStorage;
    }
}

function createNonameHeader() {
    const nonameHeader = document.createElement('div');
    nonameHeader.className = 'padding-row';
    nonameHeader.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const container = event.target;
        const parentContainer = container.parentElement;
        if (!parentContainer)
            return;
        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = Number.parseInt(window.getComputedStyle(parentContainer).left) || 0;
        const startTop = Number.parseInt(window.getComputedStyle(parentContainer).top) || 0;
        if (parentContainer.style.transform.includes('translate')) {
            const rect = parentContainer.getBoundingClientRect();
            parentContainer.style.transform = 'none';
            parentContainer.style.left = `${rect.left}px`;
            parentContainer.style.top = `${rect.top}px`;
        }
        const handleMouseMove = (event) => {
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;
            const containerWidth = parentContainer.offsetWidth;
            const containerHeight = parentContainer.offsetHeight;
            if (newLeft < containerWidth / 2
                || newTop < containerHeight / 2
                || newLeft + containerWidth / 2 > window.innerWidth
                || newTop + containerHeight / 2 > window.innerHeight) {
                return;
            }
            parentContainer.style.left = `${newLeft}px`;
            parentContainer.style.top = `${newTop}px`;
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });
    return nonameHeader;
}

var styles$1 = ".fixed-container {\n  position: fixed;\n  z-index: 100;\n  width: calc(100vw - 50px);\n  max-width: 380px;\n  background-color: rgba(255, 255, 255, 0.8);\n  backdrop-filter: blur(8px);\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  border-radius: 12px;\n  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);\n  padding: 30px;\n  padding-top: 0px;\n  text-align: center;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n  box-sizing: border-box;\n  display: none;\n}\n\n[data-theme='dark'] .fixed-container {\n  background-color: rgba(30, 30, 30, 0.8);\n  color: #fff;\n}\n\n.padding-row {\n  width: 100%;\n  height: 40px;\n}\n\n.dropdown-group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n}\n\n.dropdown-select {\n  padding: 8px;\n  padding-right: 16px;\n  border-radius: 6px;\n  border: 1px solid #e2e2e2;\n  background-color: #f5f5f5;\n  font-size: 14px;\n  width: 100%;\n}\n\n[data-theme='dark'] .dropdown-select {\n  background-color: #333;\n  border-color: #555;\n  color: #fff;\n}\n\n.checkbox-container {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n  text-align: left;\n  font-size: 14px;\n}\n\n.checkbox-container input[type='checkbox'] {\n  margin-right: 12px;\n  transform: translateY(1.5px);\n}\n\n.input-group {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n  justify-content: flex-start;\n}\n\n.input-group label {\n  text-align: left;\n  font-size: 14px;\n  margin-right: 8px;\n}\n\n.input-group input {\n  max-width: 40px;\n  padding: 6px;\n  border-radius: 6px;\n  border: 1px solid #e2e2e2;\n  text-align: center;\n}\n\n[data-theme='dark'] .input-group input {\n  background-color: #333;\n  border-color: #555;\n  color: #fff;\n}\n\n.button-group {\n  display: flex;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.button-group button {\n  flex: 1;\n  padding: 10px;\n  border-radius: 6px;\n  border: none;\n  font-size: 16px;\n  cursor: pointer;\n}\n\n.cancel-btn {\n  background-color: white;\n  border: 1px solid #e2e2e2;\n}\n\n[data-theme='dark'] .cancel-btn {\n  background-color: #333;\n  border-color: #555;\n  color: #fff;\n}\n\n.save-btn {\n  background-color: #333;\n  color: white;\n}\n\n[data-theme='dark'] .save-btn {\n  background-color: #555;\n}\n\nbutton:hover {\n  filter: brightness(1.5);\n  transition: all 0.3s;\n}\n\nstrong svg,\n.input-group > svg,\n.dropdown-group > svg {\n  width: 20px !important;\n  height: 20px !important;\n  max-width: 20px !important;\n  max-height: 20px !important;\n  transform: translateY(2px);\n  margin-right: 10px;\n  display: inline-block;\n}\n\n[data-theme='dark'] strong svg,\n[data-theme='dark'] .input-group > svg,\n[data-theme='dark'] .dropdown-group > svg {\n  filter: invert(1);\n}\n\ninput[type='checkbox'] {\n  width: 20px;\n  height: 20px;\n  margin: 0;\n  cursor: pointer;\n}\n";

function createSettingMenu(userSettings, episodeMode = false) {
    const injectStyles = () => {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles$1;
        document.head.append(styleEl);
    };
    const createSettingsDialog = () => {
        const container = document.createElement('div');
        container.className = 'fixed-container';
        const nonameHeader = createNonameHeader();
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-group';
        const spacerLeft = document.createElement('div');
        spacerLeft.style.width = '24px';
        const dropdown = document.createElement('select');
        dropdown.className = 'dropdown-select';
        const options = [
            { value: 'reactionCount', text: '按热度(贴贴数)排序' },
            { value: 'newFirst', text: '按时间排序(最新在前)' },
            { value: 'oldFirst', text: '按时间排序(最旧在前)' },
            { value: 'replyCount', text: '按评论数排序' },
        ];
        dropdown.append(...options.map((opt) => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            return option;
        }));
        dropdown.value = userSettings.sortMode || 'reactionCount';
        const spacerRight = document.createElement('div');
        spacerRight.style.width = '24px';
        const sortingIcon = $('<strong></strong>').html(Icons.sorting)[0];
        if (sortingIcon) {
            dropdownContainer.append(sortingIcon);
        }
        dropdownContainer.append(dropdown);
        dropdownContainer.append(spacerRight);
        const checkboxContainers = [];
        const hidePlainCommentsCheckboxContainer = new CustomCheckboxContainer('hidePlainComments', '隐藏普通评论', userSettings.hidePlainComments || false);
        const pinMyCommentsCheckboxContainer = new CustomCheckboxContainer('showMine', '置顶我发表/回复我的帖子', userSettings.stickyMentioned || false);
        const hidePrematureCommentsCheckboxContainer = new CustomCheckboxContainer('hidePremature', '隐藏开播前发表的评论', userSettings.hidePremature || false);
        checkboxContainers.push(hidePlainCommentsCheckboxContainer.getContainer(), pinMyCommentsCheckboxContainer.getContainer());
        if (episodeMode) {
            checkboxContainers.push(hidePrematureCommentsCheckboxContainer.getContainer());
        }
        const minEffGroup = document.createElement('div');
        minEffGroup.className = 'input-group';
        const minEffLabel = document.createElement('label');
        minEffLabel.htmlFor = 'minEffectiveNumber';
        minEffLabel.textContent = '最低有效字数 (>=0)';
        const minEffInput = document.createElement('input');
        minEffInput.type = 'number';
        minEffInput.id = 'minEffectiveNumber';
        minEffInput.value = (userSettings.minimumFeaturedCommentLength || 0).toString();
        const fontIcon = $('<strong></strong>').html(Icons.font)[0];
        if (fontIcon) {
            minEffGroup.append(fontIcon);
        }
        minEffGroup.append(minEffLabel);
        minEffGroup.append(minEffInput);
        const maxPostsGroup = document.createElement('div');
        maxPostsGroup.className = 'input-group';
        const maxPostsLabel = document.createElement('label');
        maxPostsLabel.htmlFor = 'maxSelectedPosts';
        maxPostsLabel.textContent = '最大精选评论数 (>0)';
        const maxPostsInput = document.createElement('input');
        maxPostsInput.type = 'number';
        maxPostsInput.id = 'maxSelectedPosts';
        maxPostsInput.value = (userSettings.maxFeaturedComments || 1).toString();
        const answerSheetIcon = $('<strong></strong>').html(Icons.answerSheet)[0];
        if (answerSheetIcon) {
            maxPostsGroup.append(answerSheetIcon);
        }
        maxPostsGroup.append(maxPostsLabel);
        maxPostsGroup.append(maxPostsInput);
        const spaceHr = document.createElement('hr');
        spaceHr.style.marginBottom = '16px';
        spaceHr.style.border = 'none';
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = '取消';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = '保存';
        buttonGroup.append(cancelBtn);
        buttonGroup.append(saveBtn);
        container.append(nonameHeader);
        container.append(dropdownContainer);
        container.append(minEffGroup);
        container.append(maxPostsGroup);
        container.append(...checkboxContainers);
        container.append(spaceHr);
        container.append(buttonGroup);
        document.body.append(container);
        return {
            container,
            dropdown,
            pinMyCommentsCheckboxContainer,
            hidePlainCommentsCheckboxContainer,
            hidePrematureCommentsCheckboxContainer,
            minEffInput,
            maxPostsInput,
            cancelBtn,
            saveBtn,
        };
    };
    const initSettings = (elements) => {
        const { dropdown, pinMyCommentsCheckboxContainer, hidePlainCommentsCheckboxContainer, hidePrematureCommentsCheckboxContainer, minEffInput, maxPostsInput, } = elements;
        const sortMode = Storage.get('sortMode');
        if (sortMode) {
            dropdown.value = sortMode;
        }
        const stickyMentioned = Storage.get('stickyMentioned');
        if (stickyMentioned !== undefined) {
            pinMyCommentsCheckboxContainer.getInput().checked = stickyMentioned;
        }
        const hidePremature = Storage.get('hidePremature');
        if (hidePremature !== undefined && episodeMode) {
            hidePrematureCommentsCheckboxContainer.getInput().checked = hidePremature;
        }
        const hidePlainComments = Storage.get('hidePlainComments');
        if (hidePlainComments !== undefined) {
            hidePlainCommentsCheckboxContainer.getInput().checked = hidePlainComments;
        }
        const minimumFeaturedCommentLength = Storage.get('minimumFeaturedCommentLength');
        if (minimumFeaturedCommentLength !== undefined) {
            minEffInput.value = minimumFeaturedCommentLength.toString();
        }
        const maxFeaturedComments = Storage.get('maxFeaturedComments');
        if (maxFeaturedComments !== undefined) {
            maxPostsInput.value = maxFeaturedComments.toString();
        }
    };
    const saveSettings = (elements) => {
        const { container, dropdown, pinMyCommentsCheckboxContainer, hidePrematureCommentsCheckboxContainer, hidePlainCommentsCheckboxContainer, minEffInput, maxPostsInput, } = elements;
        Storage.set('minimumFeaturedCommentLength', Math.max(Number.parseInt(minEffInput.value) || 0, 0));
        Storage.set('maxFeaturedComments', Number.parseInt(maxPostsInput.value) > 0 ? Number.parseInt(maxPostsInput.value) : 1);
        Storage.set('hidePlainComments', hidePlainCommentsCheckboxContainer.getInput().checked);
        Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.getInput().checked);
        Storage.set('sortMode', dropdown.value);
        Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.getInput().checked);
        if (episodeMode) {
            Storage.set('hidePremature', hidePrematureCommentsCheckboxContainer.getInput().checked);
        }
        const event = new CustomEvent('settingsSaved');
        document.dispatchEvent(event);
        if (window.jQuery) {
            jQuery(document).trigger('settingsSaved');
        }
        hideDialog(container);
    };
    const showDialog = (container, elements) => {
        initSettings(elements);
        container.style.display = 'block';
    };
    const hideDialog = (container) => {
        container.style.display = 'none';
    };
    const init = () => {
        injectStyles();
        const elements = createSettingsDialog();
        initSettings(elements);
        elements.saveBtn.addEventListener('click', () => saveSettings(elements));
        elements.cancelBtn.addEventListener('click', () => hideDialog(elements.container));
        window.BCE = window.BCE || {};
        window.BCE.settingsDialog = {
            show: () => showDialog(elements.container, elements),
            hide: () => hideDialog(elements.container),
            save: () => saveSettings(elements),
            getElements: () => elements,
        };
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
}

const BGM_EP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/ep\/\d+/;
const BGM_GROUP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/group\/topic\/\d+/;

function quickSort(arr, sortKey, changeCompareDirection = false) {
    if (arr.length <= 1) {
        return arr;
    }
    const pivot = arr[0];
    const left = [];
    const right = [];
    for (let i = 1; i < arr.length; i++) {
        const element = arr[i];
        const elementImportant = element.important || false;
        const pivotImportant = pivot.important || false;
        let compareResult;
        if (elementImportant !== pivotImportant) {
            compareResult = elementImportant;
        }
        else if (changeCompareDirection) {
            compareResult = element[sortKey] < pivot[sortKey];
        }
        else {
            compareResult = element[sortKey] > pivot[sortKey];
        }
        if (compareResult) {
            left.push(element);
        }
        else {
            right.push(element);
        }
    }
    return [
        ...quickSort(left, sortKey, changeCompareDirection),
        pivot,
        ...quickSort(right, sortKey, changeCompareDirection),
    ];
}
function purifiedDatetimeInMillionSeconds(timestamp) {
    return new Date(timestamp.trim().replace('- ', '')).getTime();
}

function processComments(userSettings) {
    const username = $('.idBadgerNeue .avatar').attr('href')
        ? $('.idBadgerNeue .avatar').attr('href').split('/user/')[1]
        : '';
    const preservedPostID = $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null;
    const allCommentRows = $('.row.row_reply.clearit');
    let plainCommentsCount = 0;
    let featuredCommentsCount = 0;
    let prematureCommentsCount = 0;
    const minimumContentLength = userSettings.minimumFeaturedCommentLength;
    const container = $('#comment_list');
    const plainCommentElements = [];
    const featuredCommentElements = [];
    const lastRow = allCommentRows.last();
    let preservedRow = null;
    let isLastRowFeatured = false;
    let firstBroadcastDate = null;
    if (BGM_EP_REGEX.test(location.href)) {
        try {
            const broadcastTimeMatch = document
                .querySelectorAll('.tip')[0]
                .innerHTML
                .match(/\d{4}-\d{1,2}-\d{1,2}/);
            if (broadcastTimeMatch && broadcastTimeMatch[0]) {
                const dateParts = broadcastTimeMatch[0].split('-');
                firstBroadcastDate = new Date(Number.parseInt(dateParts[0] ?? ''), Number.parseInt(dateParts[1] ?? '') - 1, Number.parseInt(dateParts[2] ?? ''));
                firstBroadcastDate.setHours(0, 0, 0, 0);
            }
        }
        catch (error) {
            console.error('Error parsing broadcast date:', error);
        }
    }
    allCommentRows.each(function (index, row) {
        const that = $(this);
        const content = $(row)
            .find(BGM_EP_REGEX.test(location.href) ? '.message.clearit' : '.inner')
            .text();
        let isBeforeBroadcast = false;
        if (firstBroadcastDate && BGM_EP_REGEX.test(location.href)) {
            try {
                const postTimeMatch = that
                    .find('.re_info')
                    .text()
                    .match(/\d{4}-\d{1,2}-\d{1,2}/);
                if (postTimeMatch && postTimeMatch[0]) {
                    const postDateParts = postTimeMatch[0].split('-');
                    const postDate = new Date(Number.parseInt(postDateParts[0] ?? ''), Number.parseInt(postDateParts[1] ?? '') - 1, Number.parseInt(postDateParts[2] ?? ''));
                    postDate.setHours(0, 0, 0, 0);
                    if (postDate < firstBroadcastDate) {
                        isBeforeBroadcast = true;
                        prematureCommentsCount++;
                    }
                }
            }
            catch (error) {
                console.error('Error parsing post date:', error);
            }
        }
        let commentScore = 0;
        const highlightMentionedColor = '#ff8c00';
        const subReplyContent = that.find('.topic_sub_reply');
        const replyCount = subReplyContent.find('.sub_reply_bg').length;
        const mentionedInMainComment = userSettings.stickyMentioned
            && that.find('.avatar').attr('href')?.split('/user/')[1] === username;
        let mentionedInSubReply = false;
        if (mentionedInMainComment) {
            that.css('border-color', highlightMentionedColor);
            that.css('border-width', '1px');
            that.css('border-style', 'dashed');
            commentScore += 10000;
        }
        that.find(`.topic_sub_reply .sub_reply_bg.clearit`).each((index, element) => {
            if (userSettings.stickyMentioned && $(element).attr('data-item-user') === username) {
                $(element).css('border-color', highlightMentionedColor);
                $(element).css('border-width', '1px');
                $(element).css('border-style', 'dashed');
                commentScore += 1000;
                mentionedInSubReply = true;
            }
        });
        const important = mentionedInMainComment || mentionedInSubReply;
        that.find('span.num').each((index, element) => {
            commentScore += Number.parseInt($(element).text());
        });
        const hasPreservedReply = preservedPostID && that.find(`#${preservedPostID}`).length > 0;
        if (hasPreservedReply)
            preservedRow = row;
        if (!hasPreservedReply)
            subReplyContent.hide();
        const timestampArea = that.find('.action').first();
        if (replyCount !== 0) {
            const a = $(`<a class="expand_all" href="javascript:void(0)" ><span>展开(+${replyCount})</span></a>`);
            mentionedInSubReply && a.css('color', highlightMentionedColor);
            a.on('click', () => {
                subReplyContent.slideToggle();
            });
            const el = $(`<div class="action"></div>`).append(a);
            timestampArea.after(el);
        }
        const isShortReply = content.trim().length < minimumContentLength;
        let isFeatured = userSettings.sortMode === 'reactionCount' ? commentScore >= 1 : replyCount >= 1;
        if (isShortReply || featuredCommentElements.length >= userSettings.maxFeaturedComments) {
            isFeatured = false;
        }
        if (hasPreservedReply || important) {
            isFeatured = true;
        }
        if (isFeatured) {
            featuredCommentsCount++;
        }
        const timestamp = isFeatured
            ? $(row)
                .find('.action:eq(0) small')
                .first()
                .contents()
                .filter(function () {
                return this.nodeType === 3;
            })
                .first()
                .text()
            : $(row).find('small').text().trim();
        if (isBeforeBroadcast) {
            console.log('Checking premature comment:', {
                row,
                hidePrematureSetting: userSettings.hidePremature,
                rowDisplay: $(row).css('display'),
            });
            $(row).addClass('premature-comment');
            if (userSettings.hidePremature) {
                $(row).hide();
                console.log('Attempted to hide premature comment. New display state:', $(row).css('display'));
            }
        }
        if (isFeatured) {
            if (row.id === lastRow[0]?.id) {
                isLastRowFeatured = true;
            }
            featuredCommentElements.push({
                element: row,
                score: commentScore,
                replyCount,
                timestampNumber: purifiedDatetimeInMillionSeconds(timestamp),
                important,
            });
        }
        else {
            plainCommentsCount++;
            plainCommentElements.push({
                element: row,
                score: commentScore,
                timestampNumber: purifiedDatetimeInMillionSeconds(timestamp),
            });
        }
    });
    return {
        plainCommentsCount,
        featuredCommentsCount,
        prematureCommentsCount,
        container,
        plainCommentElements,
        featuredCommentElements,
        preservedRow,
        lastRow,
        isLastRowFeatured,
    };
}

var butterupStyles = ".toaster{\n\tfont-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,\n\tNoto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n\tbox-sizing: border-box;\n\tpadding: 0;\n\tmargin: 0;\n\tlist-style: none;\n\toutline: none;\n\tz-index: 999999999;\n\tposition: fixed;\n\tpadding: 5px;\n}\n\n@keyframes spin {\nfrom {\n\ttransform: rotate(0deg);\n}\nto {\n\ttransform: rotate(360deg);\n}\n}\n\n.animate-spin {\nanimation: spin 1s linear infinite;\n}\n\n.toaster.bottom-right{\n\tbottom: 20px;\n\tright: 20px;\n}\n\n.toaster.bottom-left{\n\tbottom: 20px;\n\tleft: 20px;\n}\n\n.toaster.top-right{\n\ttop: 20px;\n\tright: 20px;\n}\n\n.toaster.top-left{\n\ttop: 20px;\n\tleft: 20px;\n}\n\n.toaster.bottom-center{\n\tbottom: 20px;\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n.toaster.top-center{\n\ttop: 20px;\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n.toaster.top-center ol.rack{\n\tflex-direction: column-reverse;\n}\n\n.toaster.top-left ol.rack{\n\tflex-direction: column-reverse;\n}\n\n.toaster.top-right ol.rack{\n\tflex-direction: column-reverse;\n}\n\n.toaster.bottom-center ol.rack{\n\tflex-direction: column;\n}\n\n.toaster.bottom-left ol.rack{\n\tflex-direction: column;\n}\n\n.toaster.bottom-right ol.rack{\n\tflex-direction: column;\n}\n\nol.rack{\n\tlist-style: none;\n\tpadding: 0;\n\tmargin: 0;\n\t/* reverse the list order so that the newest items are at the top */\n\tdisplay: flex;\n}\n\nol.rack li{\n\tmargin-bottom: 16px;\n}\n\n/* Stacked Toasts Enabled */\nol.rack.upperstack li{\n\tmargin-bottom: -35px;\n\ttransition: all 0.3s ease-in-out;\n}\n\nol.rack.upperstack li:hover{\n\tmargin-bottom: 16px;\n\tscale: 1.03;\n\ttransition: all 0.3s ease-in-out;\n}\n\nol.rack.lowerstack li{\n\tmargin-top: -35px;\n}\n\n\nol.rack.lowerstack{\n margin-bottom: 0px;\n}\n\n.butteruptoast{\n\tborder-radius: 8px;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tfont-size: 13px;\n\tdisplay: flex;\n\tpadding: 16px;\n\tborder: 1px solid hsl(0, 0%, 93%);\n\tbackground-color: white;\n\tgap: 6px;\n\tcolor: #282828;\n\twidth: 325px;\n\ttransition: all 0.3s ease-in-out;\n}\n\n.butteruptoast.dismissable{\n\tcursor: pointer;\n}\n\n.butteruptoast .icon{\n\tdisplay: flex;\n\talign-items: start;\n\tflex-direction: column;\n}\n\n.butteruptoast .icon svg{\n\twidth: 20px;\n\theight: 20px;\n\tfill: #282828;\n\tpadding: 0;\n\tmargin: 0;\n}\n\n.butteruptoast .notif .desc{\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 2px;\n\tpadding: 0;\n\tmargin: 0;\n}\n\n.butteruptoast .notif .desc .title{\n\tfont-weight: 600;\n\tline-height: 1.5;\n\tpadding: 0;\n\tmargin: 0;\n\n}\n\n.butteruptoast .notif .desc .message{\n\tfont-weight: 400;\n\tline-height: 1.4;\n\tpadding: 0;\n\tmargin: 0;\n}\n\n.butteruptoast.success{\n\tbackground-color: #ebfef2;\n\tcolor: hsl(140, 100%, 27%);\n\tborder: solid 1px hsl(145, 92%, 91%);\n}\n\n.butteruptoast.success .icon svg{\n\tfill: hsl(140, 100%, 27%);\n}\n\n.butteruptoast.error .icon svg{\n\tfill: hsl(0, 100%, 27%);\n}\n\n.butteruptoast.warning .icon svg{\n\tfill: hsl(50, 100%, 27%);\n}\n\n.butteruptoast.info .icon svg{\n\tfill: hsl(210, 100%, 27%);\n}\n\n.butteruptoast.error{\n\tbackground-color: #fef0f0;\n\tcolor: hsl(0, 100%, 27%);\n\tborder: solid 1px hsl(0, 92%, 91%);\n}\n\n.butteruptoast.warning{\n\tbackground-color: #fffdf0;\n\tcolor: hsl(50, 100%, 27%);\n\tborder: solid 1px hsl(50, 92%, 91%);\n}\n\n.butteruptoast.info{\n\tbackground-color: #f0f8ff;\n\tcolor: hsl(210, 100%, 27%);\n\tborder: solid 1px hsl(210, 92%, 91%);\n}\n\n/* Buttons */\n.toast-buttons{\n\tdisplay: flex;\n\tgap: 8px;\n\twidth: 100%;\n\talign-items: center;\n\tflex-direction: row;\n\tmargin-top: 16px;\n}\n\n.toast-buttons .toast-button.primary{\n\tbackground-color: #282828;\n\tcolor: white;\n\tpadding: 8px 16px;\n\tborder-radius: 4px;\n\tcursor: pointer;\n\tborder: none;\n\twidth: 100%;\n}\n\n.toast-buttons .toast-button.secondary{\n\tbackground-color: #f0f8ff;\n\tcolor: hsl(210, 100%, 27%);\n\tborder: solid 1px hsl(210, 92%, 91%);\n\tpadding: 8px 16px;\n\tborder-radius: 4px;\n\tcursor: pointer;\n\twidth: 100%;\n}\n\n/* Success toast buttons */\n.butteruptoast.success .toast-button.primary {\n\tbackground-color: hsl(145, 63%, 42%);\n\tcolor: white;\n}\n\n.butteruptoast.success .toast-button.secondary {\n\tbackground-color: hsl(145, 45%, 90%);\n\tcolor: hsl(145, 63%, 32%);\n\tborder: solid 1px hsl(145, 63%, 72%);\n}\n\n/* Error toast buttons */\n.butteruptoast.error .toast-button.primary {\n\tbackground-color: hsl(354, 70%, 54%);\n\tcolor: white;\n}\n\n.butteruptoast.error .toast-button.secondary {\n\tbackground-color: hsl(354, 30%, 90%);\n\tcolor: hsl(354, 70%, 44%);\n\tborder: solid 1px hsl(354, 70%, 74%);\n}\n\n/* Warning toast buttons */\n.butteruptoast.warning .toast-button.primary {\n\tbackground-color: hsl(45, 100%, 51%);\n\tcolor: hsl(45, 100%, 15%);\n}\n\n.butteruptoast.warning .toast-button.secondary {\n\tbackground-color: hsl(45, 100%, 96%);\n\tcolor: hsl(45, 100%, 31%);\n\tborder: solid 1px hsl(45, 100%, 76%);\n}\n\n/* Info toast buttons */\n.butteruptoast.info .toast-button.primary {\n\tbackground-color: hsl(207, 90%, 54%);\n\tcolor: white;\n}\n\n.butteruptoast.info .toast-button.secondary {\n\tbackground-color: hsl(207, 90%, 94%);\n\tcolor: hsl(207, 90%, 34%);\n\tborder: solid 1px hsl(207, 90%, 74%);\n}\n\n\n\n\n/* Entrance animations */\n/*  Note: These animations need to differ depending on the location of the toaster\n\tElements that are in the top should slide and fade down from the top\n\tElemennts that are in the bottom should slide and fade up from the bottom\n*/\n\n.toastUp{\n\tanimation: slideUp 0.5s ease-in-out;\n\tanimation-fill-mode: forwards;\n}\n\n.toastDown{\n\tanimation: slideDown 0.5s ease-in-out;\n\tanimation-fill-mode: forwards;\n}\n\n@keyframes slideDown {\n\t0% {\n\t\t\topacity: 0;\n\t\t\ttransform: translateY(-100%);\n\t}\n\t100% {\n\t\t\topacity: 1;\n\t\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideUp {\n\t0% {\n\t\t\topacity: 0;\n\t\t\ttransform: translateY(100%);\n\t}\n\t100% {\n\t\t\topacity: 1;\n\t\t\ttransform: translateY(0);\n\t}\n}\n\n.fadeOutToast{\n\tanimation: fadeOut 0.3s ease-in-out;\n\tanimation-fill-mode: forwards;\n}\n\n@keyframes fadeOut {\n\t0% {\n\t\t\topacity: 1;\n\t}\n\t100% {\n\t\t\topacity: 0;\n\t}\n}\n\n/*  Additional Styles\n\tThese styles are an alternative to the standard option. A user can choose to use these\n\tstyles by setting the theme: variable per toast\n*/\n\n/* Glass */\n\n.butteruptoast.glass{\n\tbackground-color: rgba(255, 255, 255, 0.42) !important;\n\tbackdrop-filter: blur(10px);\n\t-webkit-backdrop-filter: blur(10px);\n\tborder: none;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tcolor: #282828;\n}\n\n.butteruptoast.glass.success{\n\tbackground-color: rgba(235, 254, 242, 0.42) !important;\n\tbackdrop-filter: blur(10px);\n\t-webkit-backdrop-filter: blur(10px);\n\tborder: none;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tcolor: hsl(140, 100%, 27%);\n}\n\n.butteruptoast.glass.error{\n\tbackground-color: rgba(254, 240, 240, 0.42) !important;\n\tbackdrop-filter: blur(10px);\n\t-webkit-backdrop-filter: blur(10px);\n\tborder: none;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tcolor: hsl(0, 100%, 27%);\n}\n\n.butteruptoast.glass.warning{\n\tbackground-color: rgba(255, 253, 240, 0.42) !important;\n\tbackdrop-filter: blur(10px);\n\t-webkit-backdrop-filter: blur(10px);\n\tborder: none;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tcolor: hsl(50, 100%, 27%);\n}\n\n.butteruptoast.glass.info{\n\tbackground-color: rgba(240, 248, 255, 0.42) !important;\n\tbackdrop-filter: blur(10px);\n\t-webkit-backdrop-filter: blur(10px);\n\tborder: none;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tcolor: hsl(210, 100%, 27%);\n}\n\n/* brutalist */\n.butteruptoast.brutalist{\n\tborder-radius: 0px;\n\tbox-shadow: 0 4px 12px #0000001a;\n\tborder: solid 2px #282828;\n\tfont-size: 13px;\n\talign-items: center;\n\tdisplay: flex;\n\tpadding: 16px;\n\tbackground-color: white;\n\tgap: 6px;\n\tcolor: #282828;\n\twidth: 325px;\n}\n\n.butteruptoast.brutalist.success{\n\tbackground-color: #ebfef2;\n\tcolor: hsl(140, 100%, 27%);\n\tborder: solid 2px hsl(140, 100%, 27%);\n}\n\n.butteruptoast.brutalist.error{\n\tbackground-color: #fef0f0;\n\tcolor: hsl(0, 100%, 27%);\n\tborder: solid 2px hsl(0, 100%, 27%);\n}\n\n.butteruptoast.brutalist.warning{\n\tbackground-color: #fffdf0;\n\tcolor: hsl(50, 100%, 27%);\n\tborder: solid 2px hsl(50, 100%, 27%);\n}\n\n.butteruptoast.brutalist.info{\n\tbackground-color: #f0f8ff;\n\tcolor: hsl(210, 100%, 27%);\n\tborder: solid 2px hsl(210, 100%, 27%);\n}\n";

var styles = "\n\n.bct-button {\n  /* --button-size: 2rem;\n  width: var(--button-size);\n  height: var(--button-size); */\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  color: #000;\n  transform: translateY(4px);\n  padding: 2px 5px;\n  border: 1px solid transparent;\n}\n\n[data-theme=\"dark\"] .bct-button {\n\tcolor: #f5f5f5;\n} \n\n.bct-button:hover {\n\tborder: 1px solid lightgray;\n\tborder-radius: 4px;\n\ttransition: all 0.2s ease-in-out;\n}\n\n.bct-button svg {\n  width: 100%;\n  height: 100%;\n  /* Let the button control the size */\n  flex: 1;\n}\n\n.bct-button svg {\n  max-width: 21px;\n  max-height: 21px;\n}\n\n\n.bct-button span{\n\tfont-size: 12px!important;\n\tfont-weight: normal!important;\n\tpadding-right: 4px!important;\n}\n[data-theme=\"dark\"] .bct-button svg {\n\tfilter:invert(1)\n}\n\n.bct-checkbox {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  height: 20px;\n  cursor: pointer;\n}\n\n.bct-checkbox .bct-checkmark {\n  /* You had no styles for this in the original, but leave this as a placeholder */\n\n}\n\n\n.bct-checkbox span:last-child {\n\tmargin-left: 2px;\n}\n\n\n.premature-comment{\n  border: 1px dashed #E62727;\n}\n";

const butterup = {
    options: {
        maxToasts: 5,
        toastLife: 5000,
        currentToasts: 0,
    },
    toast({ title, message, type, location, icon, theme, customIcon, dismissable, onClick, onRender, onTimeout, customHTML, primaryButton, secondaryButton, maxToasts, duration, }) {
        if (document.querySelector('#toaster') === null) {
            const toaster = document.createElement('div');
            toaster.id = 'toaster';
            if (location === null) {
                toaster.className = 'toaster top-right';
            }
            else {
                toaster.className = `toaster ${location}`;
            }
            document.body.append(toaster);
            if (document.querySelector('#butterupRack') === null) {
                const rack = document.createElement('ol');
                rack.id = 'butterupRack';
                rack.className = 'rack';
                toaster.append(rack);
            }
        }
        else {
            const toaster = document.querySelector('#toaster');
            toaster.classList.forEach((item) => {
                if (item.includes('top-right')
                    || item.includes('top-center')
                    || item.includes('top-left')
                    || item.includes('bottom-right')
                    || item.includes('bottom-center')
                    || item.includes('bottom-left')) {
                    toaster.classList.remove(item);
                }
            });
            if (location === null) {
                toaster.className = 'toaster top-right';
            }
            else {
                toaster.className = `toaster ${location}`;
            }
            document.querySelector('#butterupRack');
        }
        if (maxToasts) {
            butterup.options.maxToasts = maxToasts;
        }
        if (duration) {
            butterup.options.toastLife = duration;
        }
        if (butterup.options.currentToasts >= butterup.options.maxToasts) {
            const oldestToast = document.querySelector('#butterupRack').firstChild;
            oldestToast.remove();
            butterup.options.currentToasts--;
        }
        const toast = document.createElement('li');
        butterup.options.currentToasts++;
        toast.className = 'butteruptoast';
        toast.className += ' toast-enter';
        if (document.querySelector('#toaster').className.includes('top-right')
            || document.querySelector('#toaster').className.includes('top-center')
            || document.querySelector('#toaster').className.includes('top-left')) {
            toast.className += ' toastDown';
        }
        if (document.querySelector('#toaster').className.includes('bottom-right')
            || document.querySelector('#toaster').className.includes('bottom-center')
            || document.querySelector('#toaster').className.includes('bottom-left')) {
            toast.className += ' toastUp';
        }
        toast.id = `butterupToast-${butterup.options.currentToasts}`;
        if (type) {
            toast.className += ` ${type}`;
        }
        if (theme) {
            toast.className += ` ${theme}`;
        }
        document.querySelector('#butterupRack').append(toast);
        if (icon === true) {
            const toastIcon = document.createElement('div');
            toastIcon.className = 'icon';
            toast.append(toastIcon);
            if (customIcon) {
                toastIcon.innerHTML = customIcon;
            }
            if (type && !customIcon) {
                toast.className += ` ${type}`;
                if (type === 'success') {
                    toastIcon.innerHTML
                        = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">'
                            + '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />'
                            + '</svg>';
                }
                if (type === 'error') {
                    toastIcon.innerHTML
                        = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">'
                            + '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />'
                            + '</svg>';
                }
                if (type === 'warning') {
                    toastIcon.innerHTML
                        = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">'
                            + '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />'
                            + '</svg>';
                }
                if (type === 'info') {
                    toastIcon.innerHTML
                        = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">'
                            + '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />'
                            + '</svg>';
                }
            }
            console.log('toastIcon', toastIcon);
        }
        const toastNotif = document.createElement('div');
        toastNotif.className = 'notif';
        toast.append(toastNotif);
        const toastDesc = document.createElement('div');
        toastDesc.className = 'desc';
        toastNotif.append(toastDesc);
        if (title) {
            const toastTitle = document.createElement('div');
            toastTitle.className = 'title';
            toastTitle.innerHTML = title;
            toastDesc.append(toastTitle);
        }
        if (customHTML) {
            const toastHTML = document.createElement('div');
            toastHTML.className = 'message';
            toastHTML.innerHTML = customHTML;
            toastDesc.append(toastHTML);
        }
        if (message) {
            const toastMessage = document.createElement('div');
            toastMessage.className = 'message';
            toastMessage.innerHTML = message;
            toastDesc.append(toastMessage);
        }
        if (primaryButton || secondaryButton) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'toast-buttons';
            toastNotif.append(buttonContainer);
            if (primaryButton) {
                const primaryBtn = document.createElement('button');
                primaryBtn.className = 'toast-button primary';
                primaryBtn.textContent = primaryButton.text;
                primaryBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    primaryButton.onClick(event);
                });
                buttonContainer.append(primaryBtn);
            }
            if (secondaryButton) {
                const secondaryBtn = document.createElement('button');
                secondaryBtn.className = 'toast-button secondary';
                secondaryBtn.textContent = secondaryButton.text;
                secondaryBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    secondaryButton.onClick(event);
                });
                buttonContainer.append(secondaryBtn);
            }
        }
        if (onClick && typeof onClick === 'function') {
            toast.addEventListener('click', (event) => {
                event.stopPropagation();
                onClick(event);
            });
        }
        if (onRender && typeof onRender === 'function') {
            onRender(toast);
        }
        if (dismissable && dismissable === true) {
            toast.className += ' dismissable';
            toast.addEventListener('click', () => {
                butterup.despawnToast(toast.id);
            });
        }
        setTimeout(() => {
            toast.classList.remove('toast-enter');
        }, 300);
        setTimeout(() => {
            if (onTimeout && typeof onTimeout === 'function') {
                onTimeout(toast);
            }
            butterup.despawnToast(toast.id);
        }, butterup.options.toastLife);
    },
    despawnToast(toastId, onClosed) {
        const toast = document.querySelector(`#${toastId}`);
        if (toast) {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                try {
                    toast.remove();
                    butterup.options.currentToasts--;
                    if (onClosed && typeof onClosed === 'function') {
                        onClosed(toast);
                    }
                }
                catch {
                }
                if (butterup.options.currentToasts === 0) {
                    const toaster = document.querySelector('#toaster');
                    toaster.remove();
                }
            }, 300);
        }
    },
    promise({ promise, loadingMessage, successMessage, errorMessage, location, theme, }) {
        const toastId = `butterupToast-${butterup.options.currentToasts + 1}`;
        this.toast({
            message: loadingMessage || 'Loading...',
            location: location,
            theme: theme || 'light',
            icon: true,
            customIcon: '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>',
            dismissable: false,
        });
        return promise.then((result) => {
            this.updatePromiseToast(toastId, {
                type: 'success',
                message: successMessage || 'Operation successful',
                icon: true,
            });
            return result;
        }, (error) => {
            this.updatePromiseToast(toastId, {
                type: 'error',
                message: errorMessage || 'An error occurred',
                icon: true,
            });
            throw error;
        });
    },
    updatePromiseToast(toastId, { type, message, icon }) {
        const toast = document.querySelector(`#${toastId}`);
        if (toast) {
            toast.className = toast.className.replaceAll(/success|error|warning|info/g, '');
            toast.classList.add(type);
            const messageEl = toast.querySelector('.message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            const iconEl = toast.querySelector('.icon');
            if (iconEl && icon) {
                iconEl.innerHTML = this.getIconForType(type);
            }
            clearTimeout(toast.timeoutId);
            toast.timeoutId = setTimeout(() => {
                this.despawnToast(toastId);
            }, this.options.toastLife);
        }
    },
    getIconForType(type) {
        switch (type) {
            case 'success':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>';
            case 'error':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>';
            case 'warning':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>';
            case 'info':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" /></svg>';
            default:
                return '';
        }
    },
};

function initCloudSettings(userSettings, episodeMode = false) {
    try {
        if (typeof chiiLib === 'undefined' || !chiiLib.ukagaka) {
            console.log('[BCE] chiiLib.ukagaka not available - using standalone settings panel');
            return false;
        }
        console.log('[BCE] Initializing CloudStorage settings integration (radio-only)');
        const configs = [];
        configs.push({
            title: '排序方式',
            name: 'sortMode',
            type: 'radio',
            defaultValue: 'reactionCount',
            getCurrentValue() {
                return userSettings.sortMode || 'reactionCount';
            },
            onChange(value) {
                Storage.set('sortMode', value);
                userSettings.sortMode = value;
            },
            options: [
                { value: 'reactionCount', label: '按热度(贴贴数)排序' },
                { value: 'newFirst', label: '按时间排序(最新在前)' },
                { value: 'oldFirst', label: '按时间排序(最旧在前)' },
                { value: 'replyCount', label: '按评论数排序' },
            ],
        });
        configs.push({
            title: '置顶我发表/回复我的帖子',
            name: 'stickyMentioned',
            type: 'radio',
            defaultValue: 'off',
            getCurrentValue() {
                return userSettings.stickyMentioned ? 'on' : 'off';
            },
            onChange(value) {
                const boolValue = value === 'on';
                Storage.set('stickyMentioned', boolValue);
                userSettings.stickyMentioned = boolValue;
            },
            options: [
                { value: 'on', label: '开启' },
                { value: 'off', label: '关闭' },
            ],
        });
        if (episodeMode) {
            configs.push({
                title: '隐藏开播前发表的评论',
                name: 'hidePremature',
                type: 'radio',
                defaultValue: 'off',
                getCurrentValue() {
                    return userSettings.hidePremature ? 'on' : 'off';
                },
                onChange(value) {
                    const boolValue = value === 'on';
                    Storage.set('hidePremature', boolValue);
                    userSettings.hidePremature = boolValue;
                },
                options: [
                    { value: 'on', label: '开启' },
                    { value: 'off', label: '关闭' },
                ],
            });
        }
        configs.forEach((config) => {
            console.log(`[BCE] Registering ${config.type} config "${config.name}"`);
            chiiLib.ukagaka.addGeneralConfig(config);
        });
        setupAutoSync(userSettings);
        return true;
    }
    catch (error) {
        console.warn('[BCE] Failed to initialize CloudStorage settings:', error);
        return false;
    }
}
function setupAutoSync(userSettings) {
    try {
        if (typeof chiiLib === 'undefined' || !chiiLib.ukagaka) {
            return;
        }
        let configsSnapshot = {};
        chiiLib.ukagaka.onOpen(() => {
            console.log('[BCE] Customize panel opened');
            configsSnapshot = {
                sortMode: userSettings.sortMode,
                stickyMentioned: userSettings.stickyMentioned ? 'on' : 'off',
                hidePremature: userSettings.hidePremature ? 'on' : 'off',
            };
        });
        chiiLib.ukagaka.onClose(() => {
            console.log('[BCE] Customize panel closed');
            const currentSettings = {
                sortMode: userSettings.sortMode,
                stickyMentioned: userSettings.stickyMentioned ? 'on' : 'off',
                hidePremature: userSettings.hidePremature ? 'on' : 'off',
            };
            if (isDictDifferent(configsSnapshot, currentSettings)) {
                console.log('[BCE] Settings changed, syncing to cloud');
                if (typeof chiiApp !== 'undefined' && chiiApp.cloud_settings) {
                    chiiApp.cloud_settings.update(currentSettings);
                }
                location.reload();
            }
        });
    }
    catch (error) {
        console.warn('[BCE] Failed to setup auto-sync:', error);
    }
}
function isDictDifferent(dict1, dict2) {
    const keys1 = Object.keys(dict1);
    const keys2 = Object.keys(dict2);
    if (keys1.length !== keys2.length)
        return true;
    for (const key of keys1) {
        if (dict1[key] !== dict2[key])
            return true;
    }
    for (const key of keys2) {
        if (!(key in dict1))
            return true;
    }
    return false;
}
function syncFromCloud(userSettings) {
    try {
        if (typeof chiiApp === 'undefined' || !chiiApp.cloud_settings) {
            return;
        }
        console.log('[BCE] Syncing settings from cloud');
        const cloudSettings = chiiApp.cloud_settings.getAll();
        if (cloudSettings.sortMode !== undefined && cloudSettings.sortMode !== userSettings.sortMode) {
            console.log('[BCE] Syncing sortMode:', cloudSettings.sortMode);
            userSettings.sortMode = cloudSettings.sortMode;
            Storage.set('sortMode', cloudSettings.sortMode);
        }
        if (cloudSettings.stickyMentioned !== undefined) {
            const boolValue = cloudSettings.stickyMentioned === 'on';
            if (boolValue !== userSettings.stickyMentioned) {
                console.log('[BCE] Syncing stickyMentioned:', boolValue);
                userSettings.stickyMentioned = boolValue;
                Storage.set('stickyMentioned', boolValue);
            }
        }
        if (cloudSettings.hidePremature !== undefined) {
            const boolValue = cloudSettings.hidePremature === 'on';
            if (boolValue !== userSettings.hidePremature) {
                console.log('[BCE] Syncing hidePremature:', boolValue);
                userSettings.hidePremature = boolValue;
                Storage.set('hidePremature', boolValue);
            }
        }
    }
    catch (error) {
        console.warn('[BCE] Failed to sync from cloud:', error);
    }
}

(async function () {
    if (!BGM_EP_REGEX.test(location.href) && !BGM_GROUP_REGEX.test(location.href)) {
        return;
    }
    Storage.init({
        hidePlainComments: true,
        minimumFeaturedCommentLength: 15,
        maxFeaturedComments: 99,
        sortMode: 'reactionCount',
        stickyMentioned: false,
        hidePremature: false,
    });
    window.BCE = window.BCE || {};
    const userSettings = {
        hidePlainComments: Storage.get('hidePlainComments'),
        minimumFeaturedCommentLength: Storage.get('minimumFeaturedCommentLength'),
        maxFeaturedComments: Storage.get('maxFeaturedComments'),
        sortMode: Storage.get('sortMode'),
        stickyMentioned: Storage.get('stickyMentioned'),
        hidePremature: Storage.get('hidePremature'),
    };
    syncFromCloud(userSettings);
    const sortModeData = userSettings.sortMode || 'reactionCount';
    (() => {
        const butterupStyleEl = document.createElement('style');
        butterupStyleEl.textContent = String(butterupStyles);
        document.head.append(butterupStyleEl);
        const styleEl = document.createElement('style');
        styleEl.textContent = String(styles);
        document.head.append(styleEl);
    })();
    let { plainCommentsCount, featuredCommentsCount, container, plainCommentElements, featuredCommentElements, preservedRow, lastRow, isLastRowFeatured, } = processComments(userSettings);
    console.log('lastRow', lastRow);
    console.log('featuredCommentElements', featuredCommentElements);
    let stateBar = container.find('.row_state.clearit');
    if (stateBar.length === 0) {
        stateBar = $(`<div id class="row_state clearit"></div>`);
    }
    const toggleButtonText = userSettings.hidePlainComments
        ? `点击展开剩余${plainCommentsCount}条普通评论`
        : `点击折叠${plainCommentsCount}条普通评论`;
    const toggleHiddenCommentsInfoText = () => {
        const curText = $(hiddenCommentsInfo).text();
        if (curText.includes('展开')) {
            hiddenCommentsInfo.text(`点击折叠${plainCommentsCount}条普通评论`);
        }
        else {
            hiddenCommentsInfo.text(`点击展开剩余${plainCommentsCount}条普通评论`);
        }
    };
    const hiddenCommentsInfo = $(`<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">${toggleButtonText}</div>`).click(() => {
        const commentList = $('#comment_list_plain');
        commentList.slideToggle();
        toggleHiddenCommentsInfoText();
    });
    stateBar.append(hiddenCommentsInfo);
    container.find('.row').detach();
    const menuBarCSSProperties = {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        transform: 'translate(0, -3px)',
        margin: '0 0 0 5px',
        cursor: 'pointer',
    };
    const settingBtn = $('<strong></strong>')
        .css(menuBarCSSProperties)
        .html(Icons.gear)
        .attr('title', '设置');
    const jumpToNewestBtn = $('<strong></strong>')
        .css(menuBarCSSProperties)
        .html(Icons.newest)
        .attr('title', '跳转到最新评论')
        .click(() => {
        $('#comment_list_plain').slideDown();
        hiddenCommentsInfo.text(`点击折叠${plainCommentsCount}条普通评论`);
        const targetId = lastRow[0]?.id;
        const targetItem = isLastRowFeatured
            ? featuredCommentElements.find(item => item.element.id === targetId)
            : plainCommentElements.at(-1);
        if (targetItem) {
            $('html, body').animate({
                scrollTop: $(targetItem.element).offset().top,
            });
        }
        $(lastRow).css({
            'background-color': '#ffd966',
            'transition': 'background-color 0.5s ease-in-out',
        });
        setTimeout(() => {
            $(lastRow).css('background-color', '');
        }, 750);
    });
    const menuBar = $('<h3 style="padding:10px;display:flex;width:100%;align-items:center;">所有精选评论</h3>');
    if (BGM_EP_REGEX.test(location.href)) {
        const showPrematureBtn = $('<strong></strong>')
            .css(menuBarCSSProperties)
            .html(Icons.eyeOpen)
            .attr('title', '显示开播前发表的评论')
            .click(() => {
            const hideStatus = $('.premature-comment').is(':visible');
            butterup.toast({
                title: `开播前发表的评论已${hideStatus ? '隐藏' : '显示'}`,
                location: 'top-right',
                dismissable: false,
                type: 'success',
                duration: 2000,
                icon: true,
            });
            $('.premature-comment').slideToggle();
        });
        menuBar.append(showPrematureBtn);
    }
    menuBar.append(settingBtn);
    menuBar.append(jumpToNewestBtn);
    container.append(menuBar);
    const trinity = {
        reactionCount() {
            featuredCommentElements = quickSort(featuredCommentElements, 'score', false);
        },
        replyCount() {
            featuredCommentElements = quickSort(featuredCommentElements, 'replyCount', false);
        },
        oldFirst() {
            featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber', true);
        },
        newFirst() {
            featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber', false);
        },
    };
    const sortFn = trinity[sortModeData];
    if (sortFn) {
        sortFn();
    }
    featuredCommentElements.forEach((element) => {
        container.append($(element.element));
    });
    plainCommentElements.forEach((element) => {
        container.append($(element.element));
    });
    container.append(stateBar);
    const plainCommentsContainer = $('<div id="comment_list_plain" style="margin-top:2rem;"></div>');
    if (userSettings.hidePlainComments) {
        plainCommentsContainer.hide();
    }
    plainCommentElements.forEach((element) => {
        plainCommentsContainer.append($(element.element));
    });
    container.append(plainCommentsContainer);
    if (preservedRow) {
        $('html, body').animate({
            scrollTop: $(preservedRow).offset().top,
        });
    }
    $('#sortMethodSelect').val(sortModeData);
    if (featuredCommentsCount < 10 && userSettings.hidePlainComments === true) {
        $('#toggleFilteredBtn').click();
    }
    initCloudSettings(userSettings, BGM_EP_REGEX.test(location.href));
    createSettingMenu(userSettings, BGM_EP_REGEX.test(location.href));
    settingBtn.on('click', () => window.BCE.settingsDialog.show());
    $(document).on('settingsSaved', () => {
        butterup.toast({
            title: '设置已保存',
            location: 'top-right',
            dismissable: false,
            type: 'success',
            duration: 1500,
            icon: true,
            onTimeout: () => {
                location.reload();
            },
        });
    });
})();
