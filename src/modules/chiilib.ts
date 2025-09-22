console.log('$', $)
const addTab = chiiLib.ukagaka.addPanelTab({
  tab: 'my_app',
  label: '更好的评论区',
  type: 'options',
  config: [
    {
      title: '111',
      name: 'myAppSetting',
      type: 'tab',
      defaultValue: 'option1',
      getCurrentValue() {
        return $.cookie('my_app_setting') || 'option1'
      },
      onChange(value) {
        $.cookie('my_app_setting', value, { expires: 30, path: '/' })
      },
      options: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
      ],
    },
  ],
})

export { addTab }
