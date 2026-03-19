---
title: '隨手 Design Pattern (4) - Repository 模式 (Repository Pattern)'
description: 'Repository 模式與 UnitOfWork 模式可說是充滿爭議，國外大神爭論不休，本篇不打算加入筆戰，只簡單提供幾個適合的應用的情境與範例'
date: 2019-08-22
category: '程式開發'
tags: ['Design Pattern', 'Repository Pattern', 'CSharp']
postSlug: 'design-pattern-4-repository-pattern'
---

> Repository 模式與 UnitOfWork 模式可說是充滿爭議，國外大神爭論不休，本篇不打算加入筆戰，只簡單提供幾個適合的應用的情境與範例，大家就自行選擇消化囉。

### Repository 模式的好處

在軟體分層那篇文章中，資料存取層的實作便是 Repository 模式的體現，有效的將資料存取隔離於商業邏輯之外，當要抽換資料來源時，無須改動展示層與商業邏輯層(前提是 Repoistory 約定的介面沒有變動)。

### 專用型 IRepository 與 泛型 IRepository

我們先定義兩種應用的模式

- 專用型 IRepository：一個 interface 實作 一個 Repository

```cs
public interface ICustomerRepository
{
    // ....
}

public class CustomerRepository : ICustomerRepository
{
    // ....
}

public interface IOrderRepository
{
    // ....
}

public class OrderRepository : IOrderRepository
{
    // ....
}
```

- 泛型 IRepository：一個 interface 實作 多個 Repository

```cs
public interface IRepository<TEntity>
{
    // ....
}

public class CustomerRepository : IRepository<TEntity>
{
    // ....
}

public class OrderRepository : IRepository<TEntity>
{
    // ....
}
```

當 Repository 有不同的介面方法的時候，專用型 IRepository 能提供最大的彈性。

當 Repoitory 有固定的 CRUD 的介面方法，泛型 IRepository 可以有效的減少重複的程式碼。

舉例來說，OrderRepository 可以是一個資料表(Order)或一組資料表(Order、OrderDetail、OrderType etc..)，若是一個資料表時適合泛型 IRepository，而一組資料表時適合專用型 IRepository。

### Repository 模式 with Daaper

而該架構對於 Dapper 這類輕量型 ORM 可以說搭配的如魚得水，因為 Dapper 執行我們定義好的 sqlcommand，專注在強型別的操作，故對於 Repository 的介面
並無直接的對應操作，也讓程式設計師有了較大的彈性去定義介面的方法，下面程式範例是專用型的寫法，改成泛型也是可以的喔。

[程式碼範例](https://github.com/raychiutw/repository-pattern)

### Repository 模式 with Entity Framwprk

若按照上面的定義，EF 定義了每個 Entity 就是一個資料表，所以要搭配 Repository 模式 應該就是適合泛型 IRepository 囉 ?

答案是：不盡然，目前兩派爭論不休。

一派說法是: EF 的 Entity 其實完整實作了 CRUD 功能，如此再包一層 IRepository 定義的 CURD 是多此一舉?

而另一派說法則是:為了要隔離 EF 多一層 Repository 是必須的。

這兩派的說法其實個有道理，大家就採用自己相信的說法吧。而我是比較支持隔離這層的。

若事情只到這也就還好，但當 UnitOfWork 也進來之後，事情變得更複雜，主要原因是一般提供的 UnitOfWork 的作法有其問題，我們來一步步說明。

### 一步步說明 UnitOfWork IRepository 與 Service 的問題

首先，關於IUnitOfWork 的定義實現

```cs
public interface IUnitOfWork
{
    IQueryable<TEntity> Set<TEntity>() where TEntity : class;
    TEntity Add<TEntity>(TEntity entity) where TEntity : class;
    TEntity Attach<TEntity>(TEntity entity) where TEntity : class;
    TEntity Remove<TEntity>(TEntity entity) where TEntity : class;
    void Commit();
    void Rollback();
    IDbContext Context { get; set; }
}
```

接下來進行 Repository 的修改

```cs
public class StudentRepository: IStudentRepository
{
    private IUnitOfWork _unitOfWork;

    public StudentRepository(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public Student Get(int id)
    {
        return _unitOfWork.Set<Student>().Where(x => x.Id == id).FirstOrDefault();
    }

    public void Add(Student student)
    {
        return _unitOfWork.Set<Student>().Add(student);
    }

    //....
}
```

再來是 Service 的修改

```cs
public class StudentService : IStudentService
{
    private IUnitOfWork _unitOfWork;
    private IStudentRepository _studentRepository;

    public StudentService(IUnitOfWork unitOfWork,
        IStudentRepository studentRepository)
    {
        _unitOfWork = unitOfWork;
        _studentRepository = studentRepository;
    }

    public Student Get(int id)
    {
        //return _unitOfWork.Set<Student>().Where(x => x.Id == id).FirstOrDefault();
        return _studentRepository.Get(id);
    }

    public bool Add(Student student)
    {
        //_unitOfWork.Add<Student>(student);
        _studentRepository.Add(student);
        return _unitOfWork.Commit();
    }

    //....
}
```

問題來了？在StudentService 中，StudentRepository 似乎變得有些多餘，因為它所做的，UnitOfWork 也都可以做，隨著項目的複雜，這樣就會造成很多的問題，比如：

- IUnitOfWork 的職責不明確。
- Repository 的職責不明確。
- Service 很困惑，因為它不知道該使用誰。
- Service 的代碼越來越亂。

###
