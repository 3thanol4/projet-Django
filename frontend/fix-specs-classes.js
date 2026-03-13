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

        // Fix class names in instantiation
        content = content.replace(/let component: App;/g, "let component: App;")
            .replace(/let service: Auth;/g, "let service: AuthService;")
            .replace(/TestBed\.inject\(Auth\);/g, "TestBed.inject(AuthService);")
            .replace(/let component: Login;/g, "let component: Login;")
            .replace(/let component: Register;/g, "let component: Register;")
            .replace(/let component: ProjectDetail;/g, "let component: ProjectDetailComponent;")
            .replace(/let fixture: ComponentFixture<ProjectDetail>;/g, "let fixture: ComponentFixture<ProjectDetailComponent>;")
            .replace(/imports: \[ProjectDetail\],/g, "imports: [ProjectDetailComponent],")
            .replace(/TestBed\.createComponent\(ProjectDetail\);/g, "TestBed.createComponent(ProjectDetailComponent);")
            .replace(/let component: ProjectList;/g, "let component: ProjectListComponent;")
            .replace(/let fixture: ComponentFixture<ProjectList>;/g, "let fixture: ComponentFixture<ProjectListComponent>;")
            .replace(/imports: \[ProjectList\],/g, "imports: [ProjectListComponent],")
            .replace(/TestBed\.createComponent\(ProjectList\);/g, "TestBed.createComponent(ProjectListComponent);")
            .replace(/let service: Project;/g, "let service: ProjectService;")
            .replace(/TestBed\.inject\(Project\);/g, "TestBed.inject(ProjectService);")
            .replace(/let service: Stats;/g, "let service: StatsService;")
            .replace(/TestBed\.inject\(Stats\);/g, "TestBed.inject(StatsService);")
            .replace(/let component: Stats;/g, "let component: StatsComponent;")
            .replace(/let fixture: ComponentFixture<Stats>;/g, "let fixture: ComponentFixture<StatsComponent>;")
            .replace(/imports: \[Stats\],/g, "imports: [StatsComponent],")
            .replace(/TestBed\.createComponent\(Stats\);/g, "TestBed.createComponent(StatsComponent);")
            .replace(/let component: TaskList;/g, "let component: TaskListComponent;")
            .replace(/let fixture: ComponentFixture<TaskList>;/g, "let fixture: ComponentFixture<TaskListComponent>;")
            .replace(/imports: \[TaskList\],/g, "imports: [TaskListComponent],")
            .replace(/TestBed\.createComponent\(TaskList\);/g, "TestBed.createComponent(TaskListComponent);")
            .replace(/let service: Task;/g, "let service: TaskService;")
            .replace(/TestBed\.inject\(Task\);/g, "TestBed.inject(TaskService);");

        if (content !== fs.readFileSync(file, 'utf8')) {
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
