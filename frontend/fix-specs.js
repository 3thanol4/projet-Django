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
        content = content.replace(/import { App } from '\.\/app';/g, "import { App } from './app.component';")
            .replace(/import { Auth } from '\.\/auth';/g, "import { AuthService } from './auth.service';")
            .replace(/import { Login } from '\.\/login';/g, "import { Login } from './login.component';")
            .replace(/import { Register } from '\.\/register';/g, "import { Register } from './register.component';")
            .replace(/import { authGuard } from '\.\/auth-guard';/g, "import { authGuard } from './auth.guard';")
            .replace(/import { tokenInterceptor } from '\.\/token-interceptor';/g, "import { tokenInterceptor } from './token.interceptor';")
            .replace(/import { ProjectDetail } from '\.\/project-detail';/g, "import { ProjectDetailComponent } from './project-detail.component';")
            .replace(/import { ProjectList } from '\.\/project-list';/g, "import { ProjectListComponent } from './project-list.component';")
            .replace(/import { Project } from '\.\/project';/g, "import { ProjectService } from './project.service';")
            .replace(/import { Stats } from '\.\/stats';/g, "import { StatsService } from './stats.service';")
            .replace(/import { TaskList } from '\.\/task-list';/g, "import { TaskListComponent } from './task-list.component';")
            .replace(/import { Task } from '\.\/task';/g, "import { TaskService } from './task.service';");

        if (content !== fs.readFileSync(file, 'utf8')) {
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
