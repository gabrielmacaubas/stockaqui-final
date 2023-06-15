import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Estoque } from '../model/estoque';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EstoqueService {
  URL_ESTOQUES = 'https://json-server-pweb.gabrielmacaubas.repl.co/estoques';
  
  constructor(private httpClient: HttpClient) { }

  listar(): Observable<Estoque[]> {
    return this.httpClient.get<Estoque[]>(this.URL_ESTOQUES);
  }

  encontrar(idParaEdicao: string): Observable<Estoque> {
    return this.httpClient.get<Estoque>(`${this.URL_ESTOQUES}/${idParaEdicao}`);
  }

  inserir(estoque: Estoque): Observable<Estoque> {
    if (estoque.nome && estoque.capacidade && estoque.descricao) {
      if (!Number.isNaN(Number(estoque.capacidade)) && Number(estoque.capacidade) > 0) {
        return this.httpClient.post<Estoque>(this.URL_ESTOQUES, estoque);
      }
    }

    alert("Estoque Inválido!");
    return new Observable<Estoque>(observer => observer.error(new Error('Estoque inválido!')));
  }

  atualizar(estoque: Estoque): Observable<Estoque> {
    return this.httpClient.put<Estoque>(`${this.URL_ESTOQUES}/${estoque.id}`, estoque);
  }

  remover(estoqueRemovido: Estoque): Observable<Estoque> {
    if (estoqueRemovido) {
      return this.httpClient.delete<Estoque>(`${this.URL_ESTOQUES}/${estoqueRemovido.id}`);
    }

    alert("Erro ao excluir!");
    return new Observable<Estoque>(observer => observer.error(new Error('Estoque inválido!')));
  }
}
