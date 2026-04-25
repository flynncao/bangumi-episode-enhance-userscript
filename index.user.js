
// ==UserScript==
// @name        bangumi-comment-enhance
// @version     0.2.20
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
    description;
    iconSvg;
    checked;
    input;
    element;
    container;
    constructor(id, label, description, iconSvg, checked) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.iconSvg = iconSvg;
        this.checked = checked;
        this.input = null;
        this.element = null;
        this.container = null;
    }
    createElement() {
        if (this.input) {
            return this.input;
        }
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = this.id;
        checkbox.className = 'bce-checkbox-input';
        checkbox.checked = this.checked;
        this.input = checkbox;
        return checkbox;
    }
    getContainer() {
        if (this.container) {
            return this.container;
        }
        const wrapper = document.createElement('label');
        wrapper.className = `bce-checkbox-wrapper${this.checked ? ' checked' : ''}`;
        wrapper.htmlFor = this.id;
        const iconDiv = document.createElement('div');
        iconDiv.className = 'bce-checkbox-icon';
        iconDiv.innerHTML = this.iconSvg;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'bce-checkbox-content';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'bce-checkbox-label';
        labelSpan.textContent = this.label;
        const descSpan = document.createElement('span');
        descSpan.className = 'bce-checkbox-description';
        descSpan.textContent = this.description;
        contentDiv.appendChild(labelSpan);
        contentDiv.appendChild(descSpan);
        const checkDiv = document.createElement('div');
        checkDiv.className = 'bce-checkbox-check';
        checkDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        const input = this.createElement();
        wrapper.appendChild(iconDiv);
        wrapper.appendChild(contentDiv);
        wrapper.appendChild(checkDiv);
        wrapper.appendChild(input);
        input.addEventListener('change', () => {
            this.checked = input.checked;
            if (input.checked) {
                wrapper.classList.add('checked');
            }
            else {
                wrapper.classList.remove('checked');
            }
        });
        this.container = wrapper;
        return wrapper;
    }
    isChecked() {
        return this.input?.checked ?? this.checked;
    }
    setChecked(checked) {
        this.checked = checked;
        if (this.input) {
            this.input.checked = checked;
        }
        if (this.container) {
            if (checked) {
                this.container.classList.add('checked');
            }
            else {
                this.container.classList.remove('checked');
            }
        }
    }
    getInput() {
        return this.input;
    }
}

const BGM_EP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/ep\/\d+/;
const BGM_GROUP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/group\/topic\/\d+/;
const NAMESPACE = 'bangumi_comment_enhance';

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
    static getDefaultValue(key) {
        const defaults = {
            hidePlainComments: true,
            minimumFeaturedCommentLength: 15,
            maxFeaturedComments: 99,
            sortMode: 'reactionCount',
            stickyMentioned: false,
            hidePremature: false,
        };
        return defaults[key];
    }
    static get(key) {
        const realKey = `${NAMESPACE}_${key}`;
        let currentValue = this.getDefaultValue(key);
        try {
            if (this.isCloudAvailable()) {
                const cloudValue = $.cookie(realKey) || this.getDefaultValue(key);
                console.log('cloudValue', cloudValue);
                currentValue = cloudValue;
            }
            return currentValue;
        }
        catch (e) {
            console.warn(`[BCE] Failed to get cloud config '${key}', falling back to localStorage:`, e);
        }
    }
    static set(key, value) {
        try {
            console.log('local value being set to', value);
            $.cookie(`${NAMESPACE}_${key}`, value, { expires: 365 });
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

var styles$1 = "/* Bangumi Comment Enhance - Modern Settings Modal */\n/* ChatGPT-inspired design with backdrop blur */\n\n/* ===== Modal Overlay ===== */\n:root {\n  --bce-modal-theme-color: #f09199;\n}\n\n.bce-modal-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 9998;\n  background: rgba(0, 0, 0, 0);\n  backdrop-filter: blur(0px);\n  -webkit-backdrop-filter: blur(0px);\n  display: none;\n  transition:\n    background 0.3s ease,\n    backdrop-filter 0.3s ease;\n}\n\n.bce-modal-overlay.active {\n  background: rgba(0, 0, 0, 0.4);\n  backdrop-filter: blur(4px);\n  -webkit-backdrop-filter: blur(4px);\n}\n\n[data-theme='dark'] .bce-modal-overlay.active {\n  background: rgba(0, 0, 0, 0.6);\n}\n\n/* ===== Modal Container ===== */\n.bce-modal {\n  position: fixed;\n  z-index: 9999;\n  width: calc(100vw - 32px);\n  max-width: 420px;\n  max-height: calc(100vh - 64px);\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%) scale(0.95);\n  background: rgba(255, 255, 255, 0.95);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border-radius: 16px;\n  box-shadow:\n    0 20px 60px rgba(0, 0, 0, 0.15),\n    0 0 0 1px rgba(0, 0, 0, 0.05);\n  display: none;\n  flex-direction: column;\n  overflow: hidden;\n  opacity: 0;\n  transition:\n    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),\n    opacity 0.2s ease;\n}\n\n.bce-modal.active {\n  transform: translate(-50%, -50%) scale(1);\n  opacity: 1;\n}\n\n[data-theme='dark'] .bce-modal {\n  background: rgba(28, 28, 30, 0.95);\n  box-shadow:\n    0 20px 60px rgba(0, 0, 0, 0.4),\n    0 0 0 1px rgba(255, 255, 255, 0.08);\n}\n\n/* ===== Modal Header ===== */\n.bce-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 20px 24px 16px;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.06);\n  /* cursor: move; */\n  /* user-select: none; */\n  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);\n}\n\n[data-theme='dark'] .bce-modal-header {\n  border-bottom-color: rgba(255, 255, 255, 0.08);\n  background: linear-gradient(180deg, rgba(40, 40, 42, 0.8) 0%, rgba(28, 28, 30, 0.4) 100%);\n}\n\n.bce-modal-title {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin: 0;\n  font-size: 17px;\n  font-weight: 600;\n  color: #1a1a1a;\n  letter-spacing: -0.01em;\n}\n\n[data-theme='dark'] .bce-modal-title {\n  color: #f5f5f7;\n}\n\n.bce-modal-title svg {\n  width: 20px;\n  height: 20px;\n  stroke: var(--bce-modal-theme-color);\n  flex-shrink: 0;\n}\n\n.bce-modal-close {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  border-radius: 8px;\n  background: transparent;\n  color: #6e6e73;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.bce-modal-close:hover {\n  background: rgba(0, 0, 0, 0.06);\n  color: #1a1a1a;\n}\n\n[data-theme='dark'] .bce-modal-close:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: #f5f5f7;\n}\n\n.bce-modal-close svg {\n  width: 18px;\n  height: 18px;\n}\n\n/* ===== Modal Body ===== */\n.bce-modal-body {\n  padding: 8px 0;\n  overflow-y: auto;\n  flex: 1;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;\n}\n\n.bce-modal-body::-webkit-scrollbar {\n  width: 6px;\n}\n\n.bce-modal-body::-webkit-scrollbar-track {\n  background: transparent;\n}\n\n.bce-modal-body::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.15);\n  border-radius: 3px;\n}\n\n[data-theme='dark'] .bce-modal-body::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.15);\n}\n\n/* ===== Section ===== */\n.bce-section {\n  padding: 16px 24px;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.04);\n}\n\n[data-theme='dark'] .bce-section {\n  border-bottom-color: rgba(255, 255, 255, 0.05);\n}\n\n.bce-section:last-of-type {\n  border-bottom: none;\n}\n\n.bce-section-title {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 0 0 16px 0;\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n  color: #6e6e73;\n}\n\n[data-theme='dark'] .bce-section-title {\n  color: #8e8e93;\n}\n\n.bce-section-title svg {\n  width: 16px;\n  height: 16px;\n  stroke: currentColor;\n  opacity: 0.8;\n}\n\n/* ===== Form Groups ===== */\n.bce-form-group {\n  margin-bottom: 16px;\n}\n\n.bce-form-group:last-child {\n  margin-bottom: 0;\n}\n\n.bce-form-label {\n  display: block;\n  margin-bottom: 8px;\n  font-size: 14px;\n  font-weight: 500;\n  color: #1a1a1a;\n}\n\n[data-theme='dark'] .bce-form-label {\n  color: #f5f5f7;\n}\n\n/* ===== Select Wrapper ===== */\n.bce-select-wrapper {\n  position: relative;\n}\n\n.bce-select-wrapper::after {\n  content: '';\n  position: absolute;\n  right: 14px;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 0;\n  height: 0;\n  border-left: 5px solid transparent;\n  border-right: 5px solid transparent;\n  border-top: 5px solid #6e6e73;\n  pointer-events: none;\n}\n\n.bce-select {\n  width: 100%;\n  padding: 12px 36px 12px 14px;\n  font-size: 14px;\n  font-weight: 400;\n  color: #1a1a1a;\n  background: rgba(0, 0, 0, 0.03);\n  border: 1px solid transparent;\n  border-radius: 10px;\n  cursor: pointer;\n  appearance: none;\n  -webkit-appearance: none;\n  transition: all 0.2s ease;\n}\n\n.bce-select:hover {\n  background: rgba(0, 0, 0, 0.05);\n}\n\n.bce-select:focus {\n  outline: none;\n  background: rgba(255, 255, 255, 0.8);\n  border-color: var(--bce-modal-theme-color);\n  box-shadow: 0 0 0 3px rgba(240, 145, 153, 0.15);\n}\n\n[data-theme='dark'] .bce-select {\n  color: #f5f5f7;\n  background: rgba(255, 255, 255, 0.06);\n}\n\n[data-theme='dark'] .bce-select:hover {\n  background: rgba(255, 255, 255, 0.1);\n}\n\n[data-theme='dark'] .bce-select:focus {\n  background: rgba(30, 30, 30, 0.8);\n  border-color: #f5a5ac;\n  box-shadow: 0 0 0 3px rgba(245, 165, 172, 0.15);\n}\n\n/* ===== Input Wrapper ===== */\n.bce-input-wrapper {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.bce-number-input {\n  width: 72px;\n  padding: 10px 12px;\n  font-size: 14px;\n  font-weight: 500;\n  color: #1a1a1a;\n  text-align: center;\n  background: rgba(0, 0, 0, 0.03);\n  border: 1px solid transparent;\n  border-radius: 10px;\n  transition: all 0.2s ease;\n}\n\n.bce-number-input:hover {\n  background: rgba(0, 0, 0, 0.05);\n}\n\n.bce-number-input:focus {\n  outline: none;\n  background: rgba(255, 255, 255, 0.8);\n  border-color: var(--bce-modal-theme-color);\n  box-shadow: 0 0 0 3px rgba(240, 145, 153, 0.15);\n}\n\n[data-theme='dark'] .bce-number-input {\n  color: #f5f5f7;\n  background: rgba(255, 255, 255, 0.06);\n}\n\n[data-theme='dark'] .bce-number-input:hover {\n  background: rgba(255, 255, 255, 0.1);\n}\n\n[data-theme='dark'] .bce-number-input:focus {\n  background: rgba(30, 30, 30, 0.8);\n  border-color: #f5a5ac;\n  box-shadow: 0 0 0 3px rgba(245, 165, 172, 0.15);\n}\n\n/* Remove number input spinners */\n.bce-number-input::-webkit-outer-spin-button,\n.bce-number-input::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n\n.bce-number-input[type='number'] {\n  -moz-appearance: textfield;\n}\n\n.bce-input-hint {\n  font-size: 13px;\n  color: #6e6e73;\n  line-height: 1.4;\n}\n\n[data-theme='dark'] .bce-input-hint {\n  color: #8e8e93;\n}\n\n/* ===== Custom Checkbox ===== */\n.bce-checkbox-wrapper {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 14px;\n  margin-bottom: 10px;\n  background: rgba(0, 0, 0, 0.02);\n  border: 1px solid transparent;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.bce-checkbox-wrapper:hover {\n  background: rgba(0, 0, 0, 0.04);\n}\n\n.bce-checkbox-wrapper.checked {\n  background: rgba(240, 145, 153, 0.08);\n  border-color: rgba(240, 145, 153, 0.3);\n}\n\n[data-theme='dark'] .bce-checkbox-wrapper {\n  background: rgba(255, 255, 255, 0.04);\n}\n\n[data-theme='dark'] .bce-checkbox-wrapper:hover {\n  background: rgba(255, 255, 255, 0.08);\n}\n\n[data-theme='dark'] .bce-checkbox-wrapper.checked {\n  background: rgba(240, 145, 153, 0.12);\n  border-color: rgba(240, 145, 153, 0.35);\n}\n\n.bce-checkbox-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  margin-top: 1px;\n  flex-shrink: 0;\n  color: #6e6e73;\n  transition: color 0.2s ease;\n}\n\n.bce-checkbox-wrapper.checked .bce-checkbox-icon {\n  color: var(--bce-modal-theme-color);\n}\n\n[data-theme='dark'] .bce-checkbox-icon {\n  color: #8e8e93;\n}\n\n[data-theme='dark'] .bce-checkbox-wrapper.checked .bce-checkbox-icon {\n  color: #f5a5ac;\n}\n\n.bce-checkbox-icon svg {\n  width: 20px;\n  height: 20px;\n  stroke-width: 1.8;\n}\n\n.bce-checkbox-content {\n  flex: 1;\n  min-width: 0;\n}\n\n.bce-checkbox-label {\n  display: block;\n  font-size: 14px;\n  font-weight: 500;\n  color: #1a1a1a;\n  margin-bottom: 3px;\n}\n\n[data-theme='dark'] .bce-checkbox-label {\n  color: #f5f5f7;\n}\n\n.bce-checkbox-description {\n  display: block;\n  font-size: 12px;\n  color: #6e6e73;\n  line-height: 1.4;\n}\n\n[data-theme='dark'] .bce-checkbox-description {\n  color: #8e8e93;\n}\n\n.bce-checkbox-input {\n  position: absolute;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.bce-checkbox-check {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border: 2px solid #c7c7cc;\n  border-radius: 6px;\n  margin-top: 1px;\n  flex-shrink: 0;\n  transition: all 0.2s ease;\n}\n\n.bce-checkbox-wrapper:hover .bce-checkbox-check {\n  border-color: #a1a1a6;\n}\n\n.bce-checkbox-wrapper.checked .bce-checkbox-check {\n  background: var(--bce-modal-theme-color);\n  border-color: var(--bce-modal-theme-color);\n}\n\n[data-theme='dark'] .bce-checkbox-check {\n  border-color: #636366;\n}\n\n[data-theme='dark'] .bce-checkbox-wrapper:hover .bce-checkbox-check {\n  border-color: #8e8e93;\n}\n\n[data-theme='dark'] .bce-checkbox-wrapper.checked .bce-checkbox-check {\n  background: #f5a5ac;\n  border-color: #f5a5ac;\n}\n\n.bce-checkbox-check svg {\n  width: 14px;\n  height: 14px;\n  stroke: white;\n  stroke-width: 2.5;\n  opacity: 0;\n  transform: scale(0.8);\n  transition: all 0.15s ease;\n}\n\n.bce-checkbox-wrapper.checked .bce-checkbox-check svg {\n  opacity: 1;\n  transform: scale(1);\n}\n\n/* ===== Modal Footer ===== */\n.bce-modal-footer {\n  display: flex;\n  gap: 12px;\n  padding: 16px 24px 20px;\n  border-top: 1px solid rgba(0, 0, 0, 0.06);\n  background: linear-gradient(0deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);\n}\n\n[data-theme='dark'] .bce-modal-footer {\n  border-top-color: rgba(255, 255, 255, 0.08);\n  background: linear-gradient(0deg, rgba(40, 40, 42, 0.8) 0%, rgba(28, 28, 30, 0.4) 100%);\n}\n\n/* ===== Buttons ===== */\n.bce-btn {\n  flex: 1;\n  padding: 12px 20px;\n  font-size: 14px;\n  font-weight: 500;\n  border: none;\n  border-radius: 10px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.bce-btn-primary {\n  background: #1a1a1a;\n  color: white;\n}\n\n.bce-btn-primary:hover {\n  background: #333;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n\n.bce-btn-primary:active {\n  transform: translateY(0);\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);\n}\n\n[data-theme='dark'] .bce-btn-primary {\n  background: #f5f5f7;\n  color: #1a1a1a;\n}\n\n[data-theme='dark'] .bce-btn-primary:hover {\n  background: #ffffff;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n\n.bce-btn-secondary {\n  background: rgba(0, 0, 0, 0.05);\n  color: #1a1a1a;\n}\n\n.bce-btn-secondary:hover {\n  background: rgba(0, 0, 0, 0.1);\n}\n\n[data-theme='dark'] .bce-btn-secondary {\n  background: rgba(255, 255, 255, 0.1);\n  color: #f5f5f7;\n}\n\n[data-theme='dark'] .bce-btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.15);\n}\n\n/* ===== Legacy styles for backwards compatibility ===== */\n.fixed-container {\n  display: none !important;\n}\n";

const ModalIcons = {
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    sort: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
};
function createSettingMenu(userSettings, episodeMode = false) {
    const injectStyles = () => {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles$1;
        document.head.append(styleEl);
    };
    const createSettingsDialog = () => {
        const overlay = document.createElement('div');
        overlay.className = 'bce-modal-overlay';
        const container = document.createElement('div');
        container.className = 'bce-modal';
        const header = document.createElement('div');
        header.className = 'bce-modal-header';
        const title = document.createElement('h2');
        title.className = 'bce-modal-title';
        title.innerHTML = `${ModalIcons.settings} 评论增强设置`;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'bce-modal-close';
        closeBtn.innerHTML = ModalIcons.close;
        closeBtn.setAttribute('aria-label', '关闭');
        header.appendChild(title);
        header.appendChild(closeBtn);
        const body = document.createElement('div');
        body.className = 'bce-modal-body';
        const sortSection = document.createElement('div');
        sortSection.className = 'bce-section';
        const sortTitle = document.createElement('h3');
        sortTitle.className = 'bce-section-title';
        sortTitle.innerHTML = `${ModalIcons.sort} 排序方式`;
        sortSection.appendChild(sortTitle);
        const sortGroup = document.createElement('div');
        sortGroup.className = 'bce-form-group';
        const selectWrapper = document.createElement('div');
        selectWrapper.className = 'bce-select-wrapper';
        const dropdown = document.createElement('select');
        dropdown.className = 'bce-select';
        const options = [
            { value: 'reactionCount', text: '按热度（贴贴数）排序' },
            { value: 'newFirst', text: '按时间排序（最新在前）' },
            { value: 'oldFirst', text: '按时间排序（最旧在前）' },
            { value: 'replyCount', text: '按评论数排序' },
        ];
        dropdown.append(...options.map((opt) => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            return option;
        }));
        dropdown.value = userSettings.sortMode || 'reactionCount';
        selectWrapper.appendChild(dropdown);
        sortGroup.appendChild(selectWrapper);
        sortSection.appendChild(sortGroup);
        body.appendChild(sortSection);
        const displaySection = document.createElement('div');
        displaySection.className = 'bce-section';
        const displayTitle = document.createElement('h3');
        displayTitle.className = 'bce-section-title';
        displayTitle.innerHTML = `${ModalIcons.list} 显示选项`;
        displaySection.appendChild(displayTitle);
        const numbersGroup = document.createElement('div');
        numbersGroup.className = 'bce-form-group';
        const minEffLabel = document.createElement('label');
        minEffLabel.className = 'bce-form-label';
        minEffLabel.textContent = '最低有效字数';
        const minEffWrapper = document.createElement('div');
        minEffWrapper.className = 'bce-input-wrapper';
        const minEffInput = document.createElement('input');
        minEffInput.type = 'number';
        minEffInput.className = 'bce-number-input';
        minEffInput.min = '0';
        minEffInput.value = (userSettings.minimumFeaturedCommentLength || 0).toString();
        const minEffHint = document.createElement('span');
        minEffHint.className = 'bce-input-hint';
        minEffHint.textContent = '字数少于该值的评论将被折叠';
        minEffWrapper.appendChild(minEffInput);
        minEffWrapper.appendChild(minEffHint);
        numbersGroup.appendChild(minEffLabel);
        numbersGroup.appendChild(minEffWrapper);
        displaySection.appendChild(numbersGroup);
        const maxPostsGroup = document.createElement('div');
        maxPostsGroup.className = 'bce-form-group';
        const maxPostsLabel = document.createElement('label');
        maxPostsLabel.className = 'bce-form-label';
        maxPostsLabel.textContent = '最大精选评论数';
        const maxPostsWrapper = document.createElement('div');
        maxPostsWrapper.className = 'bce-input-wrapper';
        const maxPostsInput = document.createElement('input');
        maxPostsInput.type = 'number';
        maxPostsInput.className = 'bce-number-input';
        maxPostsInput.min = '1';
        maxPostsInput.value = (userSettings.maxFeaturedComments || 1).toString();
        const maxPostsHint = document.createElement('span');
        maxPostsHint.className = 'bce-input-hint';
        maxPostsHint.textContent = '精选评论的最大显示数量';
        maxPostsWrapper.appendChild(maxPostsInput);
        maxPostsWrapper.appendChild(maxPostsHint);
        maxPostsGroup.appendChild(maxPostsLabel);
        maxPostsGroup.appendChild(maxPostsWrapper);
        displaySection.appendChild(maxPostsGroup);
        body.appendChild(displaySection);
        const filterSection = document.createElement('div');
        filterSection.className = 'bce-section';
        const filterTitle = document.createElement('h3');
        filterTitle.className = 'bce-section-title';
        filterTitle.innerHTML = `${ModalIcons.filter} 过滤选项`;
        filterSection.appendChild(filterTitle);
        const hidePlainCommentsCheckboxContainer = new CustomCheckboxContainer('hidePlainComments', '隐藏普通评论', '仅显示精选评论，折叠低互动内容', ModalIcons.eye, userSettings.hidePlainComments || false);
        const pinMyCommentsCheckboxContainer = new CustomCheckboxContainer('showMine', '置顶我的评论', '将我发表或回复我的帖子置顶显示', ModalIcons.user, userSettings.stickyMentioned || false);
        const hidePrematureCommentsCheckboxContainer = new CustomCheckboxContainer('hidePremature', '隐藏开播前评论', '隐藏剧集开播前发表的评论（仅单集页面）', ModalIcons.calendar, userSettings.hidePremature || false);
        filterSection.appendChild(hidePlainCommentsCheckboxContainer.getContainer());
        filterSection.appendChild(pinMyCommentsCheckboxContainer.getContainer());
        if (episodeMode) {
            filterSection.appendChild(hidePrematureCommentsCheckboxContainer.getContainer());
        }
        body.appendChild(filterSection);
        const footer = document.createElement('div');
        footer.className = 'bce-modal-footer';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'bce-btn bce-btn-secondary';
        cancelBtn.textContent = '取消';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'bce-btn bce-btn-primary';
        saveBtn.textContent = '保存设置';
        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);
        container.appendChild(header);
        container.appendChild(body);
        container.appendChild(footer);
        document.body.append(overlay);
        document.body.append(container);
        return {
            overlay,
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
        const stickyMentioned = Storage.get('stickyMentioned') === 'on';
        if (stickyMentioned !== undefined) {
            pinMyCommentsCheckboxContainer.setChecked(stickyMentioned);
        }
        const hidePremature = Storage.get('hidePremature') === 'on';
        if (hidePremature !== undefined && episodeMode) {
            hidePrematureCommentsCheckboxContainer.setChecked(hidePremature);
        }
        const hidePlainComments = Storage.get('hidePlainComments') === 'on';
        if (hidePlainComments !== undefined) {
            hidePlainCommentsCheckboxContainer.setChecked(hidePlainComments);
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
        const { container, overlay, dropdown, pinMyCommentsCheckboxContainer, hidePrematureCommentsCheckboxContainer, hidePlainCommentsCheckboxContainer, minEffInput, maxPostsInput, } = elements;
        Storage.set('minimumFeaturedCommentLength', Math.max(Number.parseInt(minEffInput.value) || 0, 0));
        Storage.set('maxFeaturedComments', Number.parseInt(maxPostsInput.value) > 0 ? Number.parseInt(maxPostsInput.value) : 1);
        Storage.set('hidePlainComments', hidePlainCommentsCheckboxContainer.isChecked() ? 'on' : 'off');
        Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.isChecked() ? 'on' : 'off');
        Storage.set('sortMode', dropdown.value);
        if (episodeMode) {
            Storage.set('hidePremature', hidePrematureCommentsCheckboxContainer.isChecked() ? 'on' : 'off');
        }
        const event = new CustomEvent('settingsSaved');
        document.dispatchEvent(event);
        if (window.jQuery) {
            jQuery(document).trigger('settingsSaved');
        }
        hideDialog(elements);
    };
    const showDialog = (elements) => {
        const { overlay, container } = elements;
        initSettings(elements);
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        overlay.style.display = 'block';
        container.style.display = 'block';
        void overlay.offsetWidth;
        void container.offsetWidth;
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            container.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
    };
    const hideDialog = (elements) => {
        const { overlay, container } = elements;
        overlay.classList.remove('active');
        container.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
            container.style.display = 'none';
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 250);
    };
    const init = () => {
        injectStyles();
        const elements = createSettingsDialog();
        initSettings(elements);
        elements.saveBtn.addEventListener('click', () => saveSettings(elements));
        elements.cancelBtn.addEventListener('click', () => hideDialog(elements));
        elements.overlay.addEventListener('click', () => hideDialog(elements));
        const closeBtn = elements.container.querySelector('.bce-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => hideDialog(elements));
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.container.classList.contains('active')) {
                hideDialog(elements);
            }
        });
        window.BCE = window.BCE || {};
        window.BCE.settingsDialog = {
            show: () => showDialog(elements),
            hide: () => hideDialog(elements),
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

var butterupStyles = ".toaster {\n  font-family:\n    ui-sans-serif,\n    system-ui,\n    -apple-system,\n    BlinkMacSystemFont,\n    Segoe UI,\n    Roboto,\n    Helvetica Neue,\n    Arial,\n    Noto Sans,\n    sans-serif,\n    Apple Color Emoji,\n    Segoe UI Emoji,\n    Segoe UI Symbol,\n    Noto Color Emoji;\n  box-sizing: border-box;\n  padding: 0;\n  margin: 0;\n  list-style: none;\n  outline: none;\n  z-index: 999999999;\n  position: fixed;\n  padding: 5px;\n}\n\n@keyframes spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.animate-spin {\n  animation: spin 1s linear infinite;\n}\n\n.toaster.bottom-right {\n  bottom: 20px;\n  right: 20px;\n}\n\n.toaster.bottom-left {\n  bottom: 20px;\n  left: 20px;\n}\n\n.toaster.top-right {\n  top: 20px;\n  right: 20px;\n}\n\n.toaster.top-left {\n  top: 20px;\n  left: 20px;\n}\n\n.toaster.bottom-center {\n  bottom: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n\n.toaster.top-center {\n  top: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n\n.toaster.top-center ol.rack {\n  flex-direction: column-reverse;\n}\n\n.toaster.top-left ol.rack {\n  flex-direction: column-reverse;\n}\n\n.toaster.top-right ol.rack {\n  flex-direction: column-reverse;\n}\n\n.toaster.bottom-center ol.rack {\n  flex-direction: column;\n}\n\n.toaster.bottom-left ol.rack {\n  flex-direction: column;\n}\n\n.toaster.bottom-right ol.rack {\n  flex-direction: column;\n}\n\nol.rack {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  /* reverse the list order so that the newest items are at the top */\n  display: flex;\n}\n\nol.rack li {\n  margin-bottom: 16px;\n}\n\n/* Stacked Toasts Enabled */\nol.rack.upperstack li {\n  margin-bottom: -35px;\n  transition: all 0.3s ease-in-out;\n}\n\nol.rack.upperstack li:hover {\n  margin-bottom: 16px;\n  scale: 1.03;\n  transition: all 0.3s ease-in-out;\n}\n\nol.rack.lowerstack li {\n  margin-top: -35px;\n}\n\nol.rack.lowerstack {\n  margin-bottom: 0px;\n}\n\n.butteruptoast {\n  border-radius: 8px;\n  box-shadow: 0 4px 12px #0000001a;\n  font-size: 13px;\n  display: flex;\n  padding: 16px;\n  border: 1px solid hsl(0, 0%, 93%);\n  background-color: white;\n  gap: 6px;\n  color: #282828;\n  width: 325px;\n  transition: all 0.3s ease-in-out;\n}\n\n.butteruptoast.dismissable {\n  cursor: pointer;\n}\n\n.butteruptoast .icon {\n  display: flex;\n  align-items: start;\n  flex-direction: column;\n}\n\n.butteruptoast .icon svg {\n  width: 20px;\n  height: 20px;\n  fill: #282828;\n  padding: 0;\n  margin: 0;\n}\n\n.butteruptoast .notif .desc {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  padding: 0;\n  margin: 0;\n}\n\n.butteruptoast .notif .desc .title {\n  font-weight: 600;\n  line-height: 1.5;\n  padding: 0;\n  margin: 0;\n}\n\n.butteruptoast .notif .desc .message {\n  font-weight: 400;\n  line-height: 1.4;\n  padding: 0;\n  margin: 0;\n}\n\n.butteruptoast.success {\n  background-color: #ebfef2;\n  color: hsl(140, 100%, 27%);\n  border: solid 1px hsl(145, 92%, 91%);\n}\n\n.butteruptoast.success .icon svg {\n  fill: hsl(140, 100%, 27%);\n}\n\n.butteruptoast.error .icon svg {\n  fill: hsl(0, 100%, 27%);\n}\n\n.butteruptoast.warning .icon svg {\n  fill: hsl(50, 100%, 27%);\n}\n\n.butteruptoast.info .icon svg {\n  fill: hsl(210, 100%, 27%);\n}\n\n.butteruptoast.error {\n  background-color: #fef0f0;\n  color: hsl(0, 100%, 27%);\n  border: solid 1px hsl(0, 92%, 91%);\n}\n\n.butteruptoast.warning {\n  background-color: #fffdf0;\n  color: hsl(50, 100%, 27%);\n  border: solid 1px hsl(50, 92%, 91%);\n}\n\n.butteruptoast.info {\n  background-color: #f0f8ff;\n  color: hsl(210, 100%, 27%);\n  border: solid 1px hsl(210, 92%, 91%);\n}\n\n/* Buttons */\n.toast-buttons {\n  display: flex;\n  gap: 8px;\n  width: 100%;\n  align-items: center;\n  flex-direction: row;\n  margin-top: 16px;\n}\n\n.toast-buttons .toast-button.primary {\n  background-color: #282828;\n  color: white;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  border: none;\n  width: 100%;\n}\n\n.toast-buttons .toast-button.secondary {\n  background-color: #f0f8ff;\n  color: hsl(210, 100%, 27%);\n  border: solid 1px hsl(210, 92%, 91%);\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  width: 100%;\n}\n\n/* Success toast buttons */\n.butteruptoast.success .toast-button.primary {\n  background-color: hsl(145, 63%, 42%);\n  color: white;\n}\n\n.butteruptoast.success .toast-button.secondary {\n  background-color: hsl(145, 45%, 90%);\n  color: hsl(145, 63%, 32%);\n  border: solid 1px hsl(145, 63%, 72%);\n}\n\n/* Error toast buttons */\n.butteruptoast.error .toast-button.primary {\n  background-color: hsl(354, 70%, 54%);\n  color: white;\n}\n\n.butteruptoast.error .toast-button.secondary {\n  background-color: hsl(354, 30%, 90%);\n  color: hsl(354, 70%, 44%);\n  border: solid 1px hsl(354, 70%, 74%);\n}\n\n/* Warning toast buttons */\n.butteruptoast.warning .toast-button.primary {\n  background-color: hsl(45, 100%, 51%);\n  color: hsl(45, 100%, 15%);\n}\n\n.butteruptoast.warning .toast-button.secondary {\n  background-color: hsl(45, 100%, 96%);\n  color: hsl(45, 100%, 31%);\n  border: solid 1px hsl(45, 100%, 76%);\n}\n\n/* Info toast buttons */\n.butteruptoast.info .toast-button.primary {\n  background-color: hsl(207, 90%, 54%);\n  color: white;\n}\n\n.butteruptoast.info .toast-button.secondary {\n  background-color: hsl(207, 90%, 94%);\n  color: hsl(207, 90%, 34%);\n  border: solid 1px hsl(207, 90%, 74%);\n}\n\n/* Entrance animations */\n/*  Note: These animations need to differ depending on the location of the toaster\n\tElements that are in the top should slide and fade down from the top\n\tElemennts that are in the bottom should slide and fade up from the bottom\n*/\n\n.toastUp {\n  animation: slideUp 0.5s ease-in-out;\n  animation-fill-mode: forwards;\n}\n\n.toastDown {\n  animation: slideDown 0.5s ease-in-out;\n  animation-fill-mode: forwards;\n}\n\n@keyframes slideDown {\n  0% {\n    opacity: 0;\n    transform: translateY(-100%);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n@keyframes slideUp {\n  0% {\n    opacity: 0;\n    transform: translateY(100%);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n.fadeOutToast {\n  animation: fadeOut 0.3s ease-in-out;\n  animation-fill-mode: forwards;\n}\n\n@keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n\n/*  Additional Styles\n\tThese styles are an alternative to the standard option. A user can choose to use these\n\tstyles by setting the theme: variable per toast\n*/\n\n/* Glass */\n\n.butteruptoast.glass {\n  background-color: rgba(255, 255, 255, 0.42) !important;\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: none;\n  box-shadow: 0 4px 12px #0000001a;\n  color: #282828;\n}\n\n.butteruptoast.glass.success {\n  background-color: rgba(235, 254, 242, 0.42) !important;\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: none;\n  box-shadow: 0 4px 12px #0000001a;\n  color: hsl(140, 100%, 27%);\n}\n\n.butteruptoast.glass.error {\n  background-color: rgba(254, 240, 240, 0.42) !important;\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: none;\n  box-shadow: 0 4px 12px #0000001a;\n  color: hsl(0, 100%, 27%);\n}\n\n.butteruptoast.glass.warning {\n  background-color: rgba(255, 253, 240, 0.42) !important;\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: none;\n  box-shadow: 0 4px 12px #0000001a;\n  color: hsl(50, 100%, 27%);\n}\n\n.butteruptoast.glass.info {\n  background-color: rgba(240, 248, 255, 0.42) !important;\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: none;\n  box-shadow: 0 4px 12px #0000001a;\n  color: hsl(210, 100%, 27%);\n}\n\n/* brutalist */\n.butteruptoast.brutalist {\n  border-radius: 0px;\n  box-shadow: 0 4px 12px #0000001a;\n  border: solid 2px #282828;\n  font-size: 13px;\n  align-items: center;\n  display: flex;\n  padding: 16px;\n  background-color: white;\n  gap: 6px;\n  color: #282828;\n  width: 325px;\n}\n\n.butteruptoast.brutalist.success {\n  background-color: #ebfef2;\n  color: hsl(140, 100%, 27%);\n  border: solid 2px hsl(140, 100%, 27%);\n}\n\n.butteruptoast.brutalist.error {\n  background-color: #fef0f0;\n  color: hsl(0, 100%, 27%);\n  border: solid 2px hsl(0, 100%, 27%);\n}\n\n.butteruptoast.brutalist.warning {\n  background-color: #fffdf0;\n  color: hsl(50, 100%, 27%);\n  border: solid 2px hsl(50, 100%, 27%);\n}\n\n.butteruptoast.brutalist.info {\n  background-color: #f0f8ff;\n  color: hsl(210, 100%, 27%);\n  border: solid 2px hsl(210, 100%, 27%);\n}\n";

var styles = ".bct-button {\n  /* --button-size: 2rem;\n  width: var(--button-size);\n  height: var(--button-size); */\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  color: #000;\n  transform: translateY(4px);\n  padding: 2px 5px;\n  border: 1px solid transparent;\n}\n\n[data-theme='dark'] .bct-button {\n  color: #f5f5f5;\n}\n\n.bct-button:hover {\n  border: 1px solid lightgray;\n  border-radius: 4px;\n  transition: all 0.2s ease-in-out;\n}\n\n.bct-button svg {\n  width: 100%;\n  height: 100%;\n  /* Let the button control the size */\n  flex: 1;\n}\n\n.bct-button svg {\n  max-width: 21px;\n  max-height: 21px;\n}\n\n.bct-button span {\n  font-size: 12px !important;\n  font-weight: normal !important;\n  padding-right: 4px !important;\n}\n[data-theme='dark'] .bct-button svg {\n  filter: invert(1);\n}\n\n.bct-checkbox {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  height: 20px;\n  cursor: pointer;\n}\n\n.bct-checkbox .bct-checkmark {\n  /* You had no styles for this in the original, but leave this as a placeholder */\n}\n\n.bct-checkbox span:last-child {\n  margin-left: 2px;\n}\n\n.premature-comment {\n  border: 1px dashed #e62727;\n}\n";

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

const Icons = {
    eyeOpen: '<svg t="1747629142037" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1338"  ><path d="M947.6 477.1c-131.1-163.4-276.3-245-435.6-245s-304.5 81.7-435.6 245c-16.4 20.5-16.4 49.7 0 70.1 131.1 163.4 276.3 245 435.6 245s304.5-81.7 435.6-245c16.4-20.4 16.4-49.6 0-70.1zM512 720c-130.6 0-251.1-67.8-363.5-207.8 112.4-140 232.9-207.8 363.5-207.8s251.1 67.8 363.5 207.8C763.1 652.2 642.6 720 512 720z" fill="#5F5F5F" p-id="1339"></path><path d="M512 592c44.1 0 79.8-35.7 79.8-79.8 0-44.1-35.7-79.8-79.8-79.8-44.1 0-79.8 35.7-79.8 79.8-0.1 44.1 35.7 79.8 79.8 79.8z m0 72c-83.8 0-151.8-68-151.8-151.8 0-83.8 68-151.8 151.8-151.8 83.8 0 151.8 68 151.8 151.8 0 83.8-68 151.8-151.8 151.8z m0 0" fill="#5F5F5F" p-id="1340"></path></svg>',
    newest: '<svg t="1747628315444" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1861"  ><path d="M512.736 992a483.648 483.648 0 0 1-164.672-28.8 36.88 36.88 0 1 1 25.104-69.36 407.456 407.456 0 1 0-184.608-136.512A36.912 36.912 0 0 1 129.488 801.6a473.424 473.424 0 0 1-97.472-290A480 480 0 1 1 512.736 992z" fill="#5F5F5F" p-id="1862"></path><path d="M685.6 638.592a32 32 0 0 1-14.032-2.96l-178.048-73.888a36.8 36.8 0 0 1-22.912-34.016V236.672a36.944 36.944 0 1 1 73.888 0v266.72l155.2 64.272a36.336 36.336 0 0 1 19.952 48 37.616 37.616 0 0 1-34.048 22.928z" fill="#5F5F5F" p-id="1863"></path></svg>',
    gear: '<svg t="1741861365461" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2783" data-darkreader-inline-fill=""  ><path d="M594.9 64.8c36.8-0.4 66.9 29.1 67.3 65.9v7.8c0 38.2 31.5 69.4 70.2 69.4 12.3 0 24.5-3.3 35-9.3l7.1-4.1c10.3-5.9 22.1-9 33.9-9 23.9 0 46.2 12.5 58.3 32.8L949.9 359c18.7 31.6 7.6 71.9-24.6 90.1l-6.9 3.9c-34 19.2-45.7 61.2-26.4 93.8 6.1 10.3 14.9 18.9 25.4 24.8l7 3.9c32.3 18 43.6 58.5 24.8 90.2L866 806.3c-9.1 15.2-23.8 26.2-41 30.6-17.1 4.4-35.3 2.2-50.7-6.4l-7-3.9c-21.9-12.2-48.5-12.4-70.6-0.4-10.7 5.9-19.7 14.5-25.9 25-6.1 10.4-9.4 22.1-9.3 33.8v7.8c0.1 17.8-7.2 34.7-20 47.1-12.6 12.2-29.6 19-47.2 19H428c-36.6 0.3-66.7-29-67.2-65.5l-0.1-7.8c-0.1-18.4-7.6-36-20.8-48.8-22.5-22-56.9-26.5-84.3-10.9l-7 4.1c-10.3 5.8-22 8.9-33.8 8.9-23.9 0-46.1-12.4-58.2-32.8L73.2 665.2c-8.9-15.1-11.3-33.2-6.7-50.1 4.6-16.9 15.8-31.3 31.2-39.8l6.8-3.9c16.2-9 28.2-24.2 33.1-42.1 4.9-17.4 2.4-36.1-6.9-51.6-6.2-10.4-15.1-19-25.7-24.9l-6.9-3.9c-15.5-8.4-27-22.8-31.7-39.8-4.7-17-2.3-35.2 6.7-50.4L156.3 218c9-15.1 23.8-26.2 41-30.6 17.1-4.4 35.3-2.1 50.7 6.5l7.1 3.9c21.9 12.3 48.6 12.5 70.7 0.5 10.8-5.9 19.8-14.6 26-25.1 6.1-10.4 9.3-22.2 9.2-34.1v-7.9c-0.2-17.8 7-34.8 19.8-47.2 12.6-12.3 29.7-19.1 47.5-19.1h166.6z m-163.2 71c-3.1 0-6.1 1.2-8.4 3.3-1.9 1.8-2.9 4.2-2.9 6.8l0.1 7.6c0.2 21.2-5.4 42-16.3 60.3a120.02 120.02 0 0 1-45.2 43.7c-37.4 20.4-82.6 20.2-119.7-0.7l-6.8-3.8c-2.8-1.6-6.1-2-9.2-1.2-2.8 0.7-5.3 2.5-6.8 5l-80 135.1c-2.7 4.5-1.1 10.2 4.1 13l6.7 3.7c18.6 10.3 34 25.3 44.7 43.4 16.3 27.6 20.6 59.9 12.1 90.8-8.5 30.8-29 56.9-56.9 72.5l-6.6 3.7c-5 2.9-6.6 8.5-3.9 12.9l80 135.1c1.9 3.2 5.7 5.3 10 5.3 2.1 0 4.3-0.5 6.1-1.6l6.8-3.8c18.1-10.3 38.8-15.8 59.9-15.8 31.8 0 62 12.3 84.7 34.4 23 22.5 35.9 52.6 36 84.7v7.5c0 5.2 4.9 9.9 11.3 9.9h160c3.2 0 6.2-1.2 8.3-3.3 1.8-1.7 2.9-4.2 2.9-6.7v-7.5c-0.1-20.9 5.6-41.6 16.4-59.8 10.8-18.3 26.4-33.4 45.1-43.7 37.3-20.4 82.4-20.2 119.5 0.6l6.7 3.8c2.8 1.5 6.1 1.9 9.2 1.1 2.8-0.7 5.3-2.5 6.8-5l80-135c2.7-4.5 1.1-10.2-4-13l-6.7-3.7c-18.4-10.2-33.7-25.2-44.4-43.3-33.8-57.1-13.4-130.5 45-163.5l6.6-3.7c5.1-2.9 6.6-8.5 3.9-13l-79.9-135.1c-2.2-3.4-6-5.4-10-5.3-2.1 0-4.3 0.5-6.1 1.6l-6.8 3.8c-18.3 10.5-39.1 16-60.2 16-66.5 0.2-120.6-53.5-120.8-119.9v-7.5c0-5.3-4.8-10-11.3-10l-160 0.3z m-3.4-15.5" fill="#5F5F5F" p-id="2784"></path><path d="M512 584c39.8 0 72-32.2 72-72s-32.2-72-72-72-72 32.2-72 72 32.2 72 72 72z m0 72c-79.5 0-144-64.5-144-144s64.5-144 144-144 144 64.5 144 144-64.5 144-144 144z m0 0" fill="#5F5F5F" p-id="2785"></path></svg>',
    expandAll: '<svg t="1775995412772" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1513"><path d="M882.9 277.2c-15.2-12.7-38-10.7-50.7 4.4L512 663.2 191.8 281.6c-12.7-15.2-35.6-17.2-50.7-4.4-15.2 12.7-17.2 35.6-4.4 50.7l347.7 414.4 0.3 0.3 0.6 0.6c0.2 0.2 0.4 0.5 0.7 0.7l0.6 0.6 0.7 0.7c0.2 0.2 0.4 0.4 0.6 0.5 0.3 0.2 0.5 0.5 0.8 0.7 0.1 0.1 0.2 0.2 0.3 0.2 0.1 0.1 0.2 0.2 0.4 0.3 0.2 0.2 0.5 0.4 0.7 0.6 0.3 0.2 0.5 0.4 0.8 0.6 0.2 0.1 0.4 0.3 0.6 0.4 0.3 0.2 0.7 0.5 1 0.7 0.1 0.1 0.3 0.2 0.4 0.2 0.4 0.3 0.8 0.5 1.3 0.8l0.1 0.1c4.6 2.6 9.6 4.1 14.7 4.6h0.2c0.5 0 0.9 0.1 1.4 0.1h3.2c0.5 0 0.9-0.1 1.4-0.1h0.2c5.1-0.4 10.1-2 14.7-4.6l0.1-0.1c0.4-0.2 0.8-0.5 1.3-0.8 0.1-0.1 0.3-0.2 0.4-0.2 0.3-0.2 0.7-0.4 1-0.7 0.2-0.1 0.4-0.3 0.6-0.4 0.3-0.2 0.5-0.4 0.8-0.6 0.2-0.2 0.5-0.4 0.7-0.6 0.1-0.1 0.2-0.2 0.4-0.3 0.1-0.1 0.2-0.2 0.3-0.2 0.3-0.2 0.5-0.4 0.8-0.7 0.2-0.2 0.4-0.4 0.6-0.5l0.7-0.7 0.6-0.6c0.2-0.2 0.4-0.5 0.7-0.7l0.6-0.6 0.3-0.3 347.7-414.4c12.4-15.1 10.4-38-4.8-50.7z" fill="#5f5f5f" p-id="1514"></path></svg>',
    collapseAll: '<svg t="1775995432841" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1697" ><path d="M141.1 746.8c15.2 12.7 38 10.7 50.7-4.4L512 360.8l320.2 381.6c12.7 15.2 35.6 17.2 50.7 4.4 15.2-12.7 17.2-35.6 4.4-50.7L539.6 281.6l-0.3-0.3-0.6-0.6c-0.2-0.2-0.4-0.5-0.7-0.7l-0.6-0.6-0.7-0.7c-0.2-0.2-0.4-0.4-0.6-0.5-0.3-0.2-0.5-0.5-0.8-0.7-0.1-0.1-0.2-0.2-0.3-0.2-0.1-0.1-0.2-0.2-0.4-0.3-0.2-0.2-0.5-0.4-0.7-0.6-0.3-0.2-0.5-0.4-0.8-0.6-0.2-0.1-0.4-0.3-0.6-0.4-0.3-0.2-0.7-0.5-1-0.7-0.1-0.1-0.3-0.2-0.4-0.2-0.4-0.3-0.8-0.5-1.3-0.8l-0.1-0.1c-4.6-2.6-9.6-4.1-14.7-4.6h-0.2c-0.5 0-0.9-0.1-1.4-0.1h-3.2c-0.5 0-0.9 0.1-1.4 0.1h-0.2c-5.1 0.4-10.1 2-14.7 4.6l-0.1 0.1c-0.4 0.2-0.8 0.5-1.3 0.8-0.1 0.1-0.3 0.2-0.4 0.2-0.3 0.2-0.7 0.4-1 0.7-0.2 0.1-0.4 0.3-0.6 0.4-0.3 0.2-0.5 0.4-0.8 0.6-0.2 0.2-0.5 0.4-0.7 0.6-0.1 0.1-0.2 0.2-0.4 0.3-0.1 0.1-0.2 0.2-0.3 0.2-0.3 0.2-0.5 0.4-0.8 0.7-0.2 0.2-0.4 0.4-0.6 0.5l-0.7 0.7-0.6 0.6c-0.2 0.2-0.4 0.5-0.7 0.7l-0.6 0.6-0.3 0.3-347.3 414.5c-12.8 15.1-10.8 38 4.4 50.7z" fill="#5f5f5f" p-id="1698"></path></svg>',
};

function initCloudSettings(userSettings, episodeMode = false) {
    try {
        if (typeof chiiLib === 'undefined' || !chiiLib.ukagaka) {
            console.log('[BCE] chiiLib.ukagaka not available - using standalone settings panel');
            return false;
        }
        console.log('[BCE] Initializing CloudStorage settings integration (radio-only)');
        const tabApp = {
            tab: 'bangumi_comment_enhance',
            label: '评论区增强',
            type: 'options',
            config: [],
        };
        const configs = [];
        configs.push({
            title: '排序方式',
            name: 'sortMode',
            type: 'radio',
            defaultValue: 'reactionCount',
            getCurrentValue() {
                return Storage.get('sortMode') || 'reactionCount';
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
                return Storage.get('stickyMentioned');
            },
            onChange(value) {
                Storage.set('stickyMentioned', value);
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
                    return Storage.get('hidePremature');
                },
                onChange(value) {
                    Storage.set('hidePremature', value);
                },
                options: [
                    { value: 'on', label: '开启' },
                    { value: 'off', label: '关闭' },
                ],
            });
        }
        configs.push({
            title: '隐藏普通评论',
            name: 'hidePlainComments',
            type: 'radio',
            defaultValue: 'off',
            getCurrentValue() {
                return Storage.get('hidePlainComments');
            },
            onChange(value) {
                Storage.set('hidePlainComments', value);
            },
            options: [
                { value: 'on', label: '开启' },
                { value: 'off', label: '关闭' },
            ],
        });
        tabApp.config = configs;
        console.log('[BCE] Registering settings tab with chiiLib.ukagaka');
        chiiLib.ukagaka.addPanelTab(tabApp);
        setUpCloudLifeCycleHooks();
    }
    catch (error) {
        console.warn('[BCE] Failed to initialize CloudStorage settings:', error);
        return false;
    }
}
function setUpCloudLifeCycleHooks() {
    try {
        if (typeof chiiLib === 'undefined' || !chiiLib.ukagaka) {
            return;
        }
        chiiLib.ukagaka.onOpen(() => {
            console.log('[BCE] Customize panel opened');
        });
        chiiLib.ukagaka.onClose(() => {
            console.log('[BCE] Customize panel closed');
            const currentSettings = {
                sortMode: Storage.get('sortMode') || 'reactionCount',
                stickyMentioned: Storage.get('stickyMentioned'),
                hidePremature: Storage.get('hidePremature'),
                hidePlainComments: Storage.get('hidePlainComments'),
            };
            if (typeof chiiApp !== 'undefined' && chiiApp.cloud_settings) {
                chiiApp.cloud_settings.update(currentSettings);
            }
        });
    }
    catch (error) {
        console.warn('[BCE] Failed to setup auto-sync:', error);
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
    let allExpanded = false;
    const preservedPostID = $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null;
    const expandToggleBtn = $('<strong></strong>')
        .css(menuBarCSSProperties)
        .html(Icons.expandAll)
        .attr('title', '展开所有评论')
        .click(() => {
        allExpanded = !allExpanded;
        const length = $('.topic_sub_reply').length;
        $('.topic_sub_reply').each(function () {
            const $this = $(this);
            if (allExpanded && length < 50) {
                $this.slideDown();
            }
            else {
                const hasPreserved = preservedPostID && $this.find(`#${preservedPostID}`).length > 0;
                if (!hasPreserved) {
                    $this.slideUp();
                }
            }
        });
        butterup.toast({
            title: allExpanded ? '已展开所有子评论' : '已折叠所有子评论',
            location: 'top-right',
            dismissable: false,
            type: 'success',
            duration: 1500,
            icon: true,
        });
        expandToggleBtn.html(allExpanded ? Icons.collapseAll : Icons.expandAll);
        expandToggleBtn.attr('title', allExpanded ? '折叠所有评论' : '展开所有评论');
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
    menuBar.append(expandToggleBtn);
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
