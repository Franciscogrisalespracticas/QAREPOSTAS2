import * as React from 'react';
import { Product, assetBase } from './catalog';

type FilmProps={product:Product;local:boolean;enabled:boolean;variant:'stage'|'card'|'hero'|'banner'|'detail'};
type FilmState={status:'loading'|'ready'|'playing'|'error';sourceIndex:number};
const playing=new Set<HTMLVideoElement>();
const LIMIT=3;
function stop(v:HTMLVideoElement){v.pause();playing.delete(v);}
function play(v:HTMLVideoElement){
 if(document.hidden || !v.isConnected)return;
 if(!playing.has(v) && playing.size>=LIMIT){
  const old=Array.from(playing).find(x=>x.dataset.priority!=='true');
  if(old)stop(old);
  else if(v.dataset.priority!=='true')return;
  else {const first=Array.from(playing)[0];if(first)stop(first);}
 }
 playing.add(v);
 const result=v.play();
 if(result && typeof result.catch==='function')result.catch(()=>playing.delete(v));
}
/** Videos de archivo autenticos: primero MP4 local, despues CDN original, despues endpoint Pexels. */
export class FilmMedia extends React.Component<FilmProps,FilmState>{
 state:FilmState={status:'loading',sourceIndex:0};
 private video:HTMLVideoElement|null=null;
 private observer:IntersectionObserver|null=null;
 private sources(){
  const p=this.props.product;
  return [...(this.props.local?[`${assetBase}/video/${p.id}.mp4`]:[]),p.videoDirectUrl,`https://www.pexels.com/download/video/${p.videoId}/`];
 }
 private source(){return this.sources()[this.state.sourceIndex] || '';}
 private isPriority(){return this.props.variant==='stage'||this.props.variant==='hero'||this.props.variant==='detail';}
 private onVisibility=()=>{const el=this.video;if(!el)return;if(document.hidden)stop(el);else if(this.props.enabled&&el.getBoundingClientRect().bottom>0&&el.getBoundingClientRect().top<innerHeight)play(el);};
 componentDidMount(){this.observe();}
 componentDidUpdate(prev:FilmProps){
  if(prev.product.id!==this.props.product.id||prev.local!==this.props.local||prev.enabled!==this.props.enabled){
   this.cleanup();
   this.setState({status:'loading',sourceIndex:0},()=>this.observe());
  }
 }
 componentWillUnmount(){this.cleanup();}
 private cleanup(){this.observer?.disconnect();this.observer=null;document.removeEventListener('visibilitychange',this.onVisibility);if(this.video)stop(this.video);}
 private observe(){
  const el=this.video;if(!el||!this.props.enabled)return;
  if(typeof IntersectionObserver==='undefined'){play(el);return;}
  this.observer=new IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting))play(el);else stop(el);
  },{rootMargin:this.isPriority()?'0px':'-15% 0px -15% 0px',threshold:this.isPriority()?.15:.45});
  this.observer.observe(el);
  document.addEventListener('visibilitychange',this.onVisibility);
 }
 private failed=()=>{
  if(this.video)playing.delete(this.video);
  const next=this.state.sourceIndex+1;
  if(next<this.sources().length){
   this.setState({status:'loading',sourceIndex:next},()=>{this.video?.load();if(this.video&&this.props.enabled&&this.video.getBoundingClientRect().bottom>0&&this.video.getBoundingClientRect().top<innerHeight)play(this.video);});
  }else this.setState({status:'error'});
 };
 render(){
  if(!this.props.enabled)return null;
  const p=this.props.product,priority=this.isPriority(),local=this.props.local&&this.state.sourceIndex===0;
  return <div className={`film-shell film-shell-${this.props.variant}`}>
   <video ref={el=>{this.video=el;}}
    className={`real-food-film film-${this.props.variant} ${['ready','playing'].includes(this.state.status)?'film-visible':''}`}
    data-priority={priority?'true':'false'} data-product-id={p.id}
    data-media={local?'local':'external'}
    src={this.source()} poster={p.image} muted playsInline loop preload={priority?'metadata':'none'}
    onLoadedData={()=>this.setState({status:'ready'})}
    onPlaying={()=>{if(this.video)playing.add(this.video);if(this.state.status!=='playing')this.setState({status:'playing'});}}
    onPause={()=>{if(this.video)playing.delete(this.video);if(this.state.status==='playing')this.setState({status:'ready'});}}
    onError={this.failed}
    aria-label={`Video de preparacion relacionado con ${p.name}`}/>
   {this.props.variant==='stage'&&<div className={`film-state ${this.state.status}`} role="status">
    {this.state.status==='playing'?'VIDEO REAL REPRODUCIENDOSE':this.state.status==='ready'?'VIDEO LISTO':this.state.status==='error'?'VIDEO NO DISPONIBLE: INSTALAR MP4 LOCAL':local?'CARGANDO MP4 LOCAL...':'CARGANDO VIDEO DE ARCHIVO...'}
   </div>}
  </div>;
 }
}
