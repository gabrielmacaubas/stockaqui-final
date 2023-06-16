import { Injectable, Query } from '@angular/core';
import {from, Observable} from 'rxjs';
import { Produto } from '../model/produto';
import { EstoqueService } from './estoque.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  colecaoProdutos: AngularFirestoreCollection<Produto>;
  NOME_COLECAO = 'produtos';
  
  constructor(private afs: AngularFirestore, private estoqueService: EstoqueService) {
    this.colecaoProdutos = afs.collection(this.NOME_COLECAO);
  }

  encontrar(idParaEdicao: string): Observable<Produto> {
    return this.colecaoProdutos.doc(idParaEdicao).get().pipe(map(
      document => new Produto(document.id, document.data())
    ));
  }
  
  encontrarPorEstoque(fk_estoque: string): Observable<Produto[]> {
    return from(this.colecaoProdutos.ref.where('fk_estoque', '==', fk_estoque).get().then(snapshot => {
      return snapshot.docs.map(doc => {
        const data = doc.data() as Produto;
        const id = doc.id;
        return {id, ...data};
      });
    }));
  }

  alterarOcupacao(id: string, aumentar: Boolean): void {
    this.estoqueService.encontrar(id).subscribe(
      estoque => {
        if (estoque.ocupacao != undefined) {
          if (aumentar) {
            console.log(estoque.ocupacao);
            estoque.ocupacao = estoque.ocupacao + 1;
            
            this.estoqueService.atualizar(estoque).subscribe(
              retorno => console.log("atualizou")
            );
          } else {
            estoque.ocupacao--;

            this.estoqueService.atualizar(estoque).subscribe(
              retorno => console.log("atualizou")
            );
          }     
        }
      }
    );
  }

  inserir(produto: Produto): Observable<Object> {
    delete produto.id;

    if (produto.nome && produto.valor && produto.descricao) {
      if (!Number.isNaN(Number(produto.valor)) && Number(produto.valor) > 0) {
        this.alterarOcupacao(produto.fk_estoque, true);
        return from(this.colecaoProdutos.add(Object.assign({}, produto)));   
      }
    }

    alert("Produto Inválido!");
    return new Observable<Produto>(observer => observer.error(new Error('Produto inválido!')));
  }

  atualizar(produto: Produto): Observable<void> {
    const id = produto.id;

    delete produto.id;
    return from(this.colecaoProdutos.doc(id).update(Object.assign({}, produto)));
  }

  remover(produtoRemovido: Produto): Observable<void> {
    if (produtoRemovido) {
      this.alterarOcupacao(produtoRemovido.fk_estoque, false);
      return from(this.colecaoProdutos.doc(produtoRemovido.id).delete());
    }

    alert("Erro ao excluir!");
    return new Observable<void>(observer => observer.error(new Error('Produto inválido!')));
  }
  
}
