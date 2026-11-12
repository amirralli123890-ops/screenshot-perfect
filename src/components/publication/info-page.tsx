import {Link} from '@tanstack/react-router';
import {ChevronRight} from 'lucide-react';
import {Shell} from './shell';
import type {ReactNode} from 'react';
export function InfoPage({title,subtitle,children}:{title:string,subtitle:string,children:ReactNode}){return <Shell><div className="site-container"><div className="page-heading"><div className="breadcrumbs"><Link to="/">Home</Link><ChevronRight className="size-3"/><span>{title}</span></div><h1>{title}</h1><p>{subtitle}</p></div><div className="prose">{children}</div></div></Shell>;}
