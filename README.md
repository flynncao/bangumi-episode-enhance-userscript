This script enhances the episode page with the following features:

* Sub-replies Toggle: Sub-replies are hidden by default.
Comments Reordering: Episode comments are automatically reordered based on a customizable VALUE metric. Comments without reactions (likes or other responses) and with no more than 15 Chinese characters are hidden by default. You can display them by clicking the footer's status area.

> Note: The VALUE calculation method and criteria may change in the future and can ideally be customized by the user.

这个脚本改进了Bangumi剧集页，提供了以下特性：

* 楼中楼显示/隐藏: 默认隐藏子回复
* 按价值排序留言： 依据特定的价值基准排列帖子。无任何贴贴（表情回复）以及字数少于15个字的将会被视为普通评论而被默认影藏，点击底部状态区域可以恢复。

> 提示：“价值”的评定标准和权重会在未来修改，最理想的情况是用户自行决定。

## Log

0.0.4：添加了bgm.tv等镜像站点的支持
0.0.5：修复了部分页面不显示折叠普通评论区的bug
0.0.6: 测试Github自动版本推送
0.0.7: 
Fix: 电波提醒时，点击“回复我”跳转到楼中楼等被自动隐藏的情况（现在“回复我”的楼层不会被折叠且默认会添加到精选评论中）
Feat: 允许用户自定义精选评论最低字数限制和最大显示的精选评论数，是否要隐藏普通评论等行为
（注意：最大显示的精选评论数是最多显示个数而不是默认填满，如果评论太少，请尝试修改参数或者不折叠普通评论）
