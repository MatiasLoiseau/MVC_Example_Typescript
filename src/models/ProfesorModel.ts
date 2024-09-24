import { Column, 
    CreateDateColumn, 
    Entity, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn,
    ManyToMany,
    JoinTable
   } from "typeorm";
import { Curso } from "./CursoModel";

@Entity('profesores')
export class Profesor {
@PrimaryGeneratedColumn()
id: number;

@Column()
dni: string;

@Column()
nombre: string;

@Column()
apellido: string;

@Column()
email: string;

@Column()
profesion: string;

@Column()
telefono: string;

@CreateDateColumn()
createAt: Date;

@UpdateDateColumn()
updateAt: Date;

@ManyToMany(() => Curso)
@JoinTable({
   name: 'cursos_profesores',
   joinColumn: { name: 'profesor_id', referencedColumnName: 'id' },
   inverseJoinColumn: { name: 'curso_id', referencedColumnName: 'id' }
})
cursos: Curso[];
}
