const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(appDir);

files.forEach(file => {
    if (file.endsWith('.spec.ts')) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // General fixes for the bad imports in spec files
content = content
    .replaceAll(/import { App } from '\.\/app';/g, "import { App } from './app.component';")
    .replaceAll(/import { Auth } from '\.\/auth';/g, "import { AuthService } from './auth.service';")
    .replaceAll(/import { Login } from '\.\/login';/g, "import { Login } from './login.component';")
    .replaceAll(/import { Register } from '\.\/register';/g, "import { Register } from './register.component';")
    .replaceAll(/import { authGuard } from '\.\/auth-guard';/g, "import { authGuard } from './auth.guard';")
    .replaceAll(/import { tokenInterceptor } from '\.\/token-interceptor';/g, "import { tokenInterceptor } from './token.interceptor';")
    .replaceAll(/import { ProjectDetail } from '\.\/project-detail';/g, "import { ProjectDetailComponent } from './project-detail.component';")
    .replaceAll(/import { ProjectList } from '\.\/project-list';/g, "import { ProjectListComponent } from './project-list.component';")
    .replaceAll(/import { Project } from '\.\/project';/g, "import { ProjectService } from './project.service';")
    .replaceAll(/import { Stats } from '\.\/stats';/g, "import { StatsService } from './stats.service';")
    .replaceAll(/import { TaskList } from '\.\/task-list';/g, "import { TaskListComponent } from './task-list.component';")
    .replaceAll(/import { Task } from '\.\/task';/g, "import { TaskService } from './task.service';");

        if (content !== fs.readFileSync(file, 'utf8')) {
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
