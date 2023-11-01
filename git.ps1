# 解析命令行参数
param(
    [Parameter(Mandatory = $false)]
    [switch]$s, 

    [Parameter(Mandatory = $false)]
    [string]$comment = $args[1]
)

# 检查当前文件夹是否是git仓库
if (-not (Test-Path .git)) {
    # 如果不是git仓库
    Write-Host "The current folder is not a Git repository."

    # 获取用户输入的仓库名称
    $repoName = Read-Host "Please enter the repository name"

    # 初始化git仓库
    git init

    # 添加远程仓库
    git remote add github-origin "https://github.com/lanbinshijie/$repoName.git"
    git remote add gitea-origin "https://git.lanbin.top/lanbinshijie/$repoName.git"

    # 创建一个commit
    git add .
    git commit -m "chore: init git repo"

    # 切换到main分支
    git branch -M main

    # 拉取远程仓库的代码
    git pull github-origin main --rebase
    git pull gitea-origin main --rebase

    # 推送到远程仓库
    git push github-origin main
    git push gitea-origin main

} else {
    # 如果是git仓库
    Write-Host "The current folder is a Git repository."

    # 切换到main分支
    git checkout main

    if ($s -and $comment) {
        # 添加所有更改并提交
        git add .
        git commit -m "$comment"

        # 推送到两个远程仓库
        git push github-origin main
        git push gitea-origin main
    } elseif ($s) {
        Write-Host "Please provide a commit comment."
    } else {
        Write-Host "Invalid or missing parameters."
    }
}
